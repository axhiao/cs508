import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get offers (received or sent)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    let query;
    if (type === 'received') {
      query = `
        SELECT o.*, l.title as listing_title, u.username as buyer_name
        FROM offers o
        JOIN listings l ON o.listing_id = l.listing_id
        JOIN users u ON o.buyer_id = u.user_id
        WHERE l.seller_id = ?
        ORDER BY o.created_at DESC
      `;
    } else {
      query = `
        SELECT o.*, l.title as listing_title, u.username as seller_name
        FROM offers o
        JOIN listings l ON o.listing_id = l.listing_id
        JOIN users u ON l.seller_id = u.user_id
        WHERE o.buyer_id = ?
        ORDER BY o.created_at DESC
      `;
    }
    const [rows] = await pool.query(query, [userId]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Create a new offer
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const { listing_id, offer_amount } = await request.json();
    if (!listing_id || !offer_amount) {
      return NextResponse.json({ message: 'Listing ID and offer amount are required' }, { status: 400 });
    }
    const [listings] = await pool.query('SELECT * FROM listings WHERE listing_id = ? AND is_available = true', [listing_id]);
    if (listings.length === 0) {
      return NextResponse.json({ message: 'Listing not found or not available' }, { status: 404 });
    }
    const listing = listings[0];
    if (listing.seller_id === userId) {
      return NextResponse.json({ message: 'Cannot make an offer on your own listing' }, { status: 400 });
    }
    const [existingOffers] = await pool.query('SELECT * FROM offers WHERE listing_id = ? AND buyer_id = ? AND status = "Pending"', [listing_id, userId]);
    if (existingOffers.length > 0) {
      return NextResponse.json({ message: 'You already have a pending offer for this listing' }, { status: 400 });
    }
    const [result] = await pool.query('INSERT INTO offers (listing_id, buyer_id, offer_amount) VALUES (?, ?, ?)', [listing_id, userId, offer_amount]);
    return NextResponse.json({ message: 'Offer created successfully', offerId: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Update offer status (accept/reject)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const { offer_id, status } = await request.json();
    if (!offer_id || !status) {
      return NextResponse.json({ message: 'Offer ID and status are required' }, { status: 400 });
    }
    if (!['Accepted', 'Rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }
    const [offers] = await pool.query(
      `SELECT o.*, l.seller_id
       FROM offers o
       JOIN listings l ON o.listing_id = l.listing_id
       WHERE o.offer_id = ?`,
      [offer_id]
    );
    if (offers.length === 0) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }
    const offer = offers[0];
    if (offer.seller_id !== userId) {
      return NextResponse.json({ message: 'Not authorized to update this offer' }, { status: 403 });
    }
    if (offer.status !== 'Pending') {
      return NextResponse.json({ message: 'Can only update pending offers' }, { status: 400 });
    }
    await pool.query('UPDATE offers SET status = ? WHERE offer_id = ?', [status, offer_id]);
    if (status === 'Accepted') {
      await pool.query(
        `INSERT INTO transactions (
          listing_id, seller_id, buyer_id, offer_id, amount, status
        ) VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [offer.listing_id, offer.seller_id, offer.buyer_id, offer_id, offer.offer_amount]
      );
      await pool.query('UPDATE listings SET is_available = false WHERE listing_id = ?', [offer.listing_id]);
    }
    return NextResponse.json({ message: 'Offer updated successfully' });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 