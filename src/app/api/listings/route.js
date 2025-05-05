import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get all listings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');

    let query = `
      SELECT l.*, c.name as category_name, u.username as seller_name
      FROM listings l
      JOIN categories c ON l.category_id = c.category_id
      JOIN users u ON l.seller_id = u.user_id
      WHERE l.is_available = true
    `;
    const params = [];

    if (category) {
      query += ' AND c.category_id = ?';
      params.push(category);
    }

    if (minPrice) {
      query += ' AND l.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND l.price <= ?';
      params.push(maxPrice);
    }

    if (condition) {
      query += ' AND l.condition_type = ?';
      params.push(condition);
    }

    query += ' ORDER BY l.created_at DESC';

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new listing
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    const { title, description, price, category_id, condition_type, location, image_url } =
      await request.json();

    if (!title || !description || !price || !category_id || !condition_type || !location) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO listings (
        title, description, price, seller_id, category_id,
        condition_type, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, userId, category_id, condition_type, location]
    );

    const listingId = result.insertId;
    // 如果有图片，插入listing_images表
    if (image_url) {
      await pool.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES (?, ?, TRUE)`,
        [listingId, image_url]
      );
    }

    return NextResponse.json(
      {
        message: 'Listing created successfully',
        listingId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Edit a listing
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const { id, title, description, price, category_id, condition_type, location } = await request.json();
    if (!id || !title || !description || !price || !category_id || !condition_type || !location) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }
    // 只允许卖家本人编辑
    const [rows] = await pool.query('SELECT seller_id FROM listings WHERE listing_id = ?', [id]);
    if (!rows.length || rows[0].seller_id !== userId) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    await pool.query(
      `UPDATE listings SET title=?, description=?, price=?, category_id=?, condition_type=?, location=? WHERE listing_id=?`,
      [title, description, price, category_id, condition_type, location, id]
    );
    return NextResponse.json({ message: 'Listing updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 