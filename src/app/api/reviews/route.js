import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get reviews for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    const [reviews] = await pool.query(
      `SELECT r.*, u1.username as reviewer_name, t.listing_id, l.title as listing_title
       FROM reviews r
       JOIN users u1 ON r.reviewer_id = u1.user_id
       JOIN transactions t ON r.transaction_id = t.transaction_id
       JOIN listings l ON t.listing_id = l.listing_id
       WHERE r.reviewed_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Create a new review
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const { transaction_id, rating, comment } = await request.json();
    if (!transaction_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Valid transaction ID and rating (1-5) are required' }, { status: 400 });
    }
    // Get transaction details
    const [transactions] = await pool.query(
      `SELECT * FROM transactions WHERE transaction_id = ? AND status = 'Completed'`,
      [transaction_id]
    );
    if (transactions.length === 0) {
      return NextResponse.json({ message: 'Transaction not found or not completed' }, { status: 404 });
    }
    const transaction = transactions[0];
    // Verify the user is part of the transaction
    if (transaction.buyer_id !== userId && transaction.seller_id !== userId) {
      return NextResponse.json({ message: 'Not authorized to review this transaction' }, { status: 403 });
    }
    // Determine the reviewed user (the other party in the transaction)
    const reviewed_id = transaction.buyer_id === userId
      ? transaction.seller_id
      : transaction.buyer_id;
    // Check if user has already reviewed this transaction
    const [existingReviews] = await pool.query(
      'SELECT * FROM reviews WHERE transaction_id = ? AND reviewer_id = ?',
      [transaction_id, userId]
    );
    if (existingReviews.length > 0) {
      return NextResponse.json({ message: 'You have already reviewed this transaction' }, { status: 400 });
    }
    // Create the review
    const [result] = await pool.query(
      'INSERT INTO reviews (reviewer_id, reviewed_id, transaction_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, reviewed_id, transaction_id, rating, comment]
    );
    return NextResponse.json({ message: 'Review created successfully', reviewId: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 