import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get('offer_id');
  if (!offerId) {
    return NextResponse.json({ message: 'offer_id is required' }, { status: 400 });
  }
  const [rows] = await pool.query('SELECT * FROM transactions WHERE offer_id = ?', [offerId]);
  return NextResponse.json(rows);
} 