import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json([], { status: 401 });
  }
  const userId = session.user.id;
  const [listings] = await pool.query(
    `SELECT l.*, c.name as category_name
      FROM listings l
      JOIN categories c ON l.category_id = c.category_id
      WHERE l.seller_id = ?
      ORDER BY l.created_at DESC`,
    [userId]
  );
  return NextResponse.json(listings);
} 