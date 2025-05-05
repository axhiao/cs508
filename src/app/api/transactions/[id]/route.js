import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request, context) {
  try {
    console.log('PUT /api/transactions/[id] called', { params: context.params });
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session || !session.user) {
      console.log('No session or user');
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const params = await context.params;
    console.log('context.params:', params);
    const transactionId = params.id;
    const { status } = await request.json();
    console.log('transactionId:', transactionId, 'status:', status);
    if (!transactionId || !status) {
      console.log('Missing transactionId or status');
      return NextResponse.json({ message: 'Transaction ID and status are required' }, { status: 400 });
    }
    if (!['Completed', 'Cancelled'].includes(status)) {
      console.log('Invalid status:', status);
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }
    // Get transaction
    const [transactions] = await pool.query('SELECT * FROM transactions WHERE transaction_id = ?', [transactionId]);
    console.log('SQL: SELECT * FROM transactions WHERE transaction_id = ?', [transactionId]);
    if (transactions.length === 0) {
      console.log('Transaction not found');
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }
    const transaction = transactions[0];
    if (transaction.seller_id !== userId && transaction.buyer_id !== userId) {
      console.log('Not authorized');
      return NextResponse.json({ message: 'Not authorized to update this transaction' }, { status: 403 });
    }
    if (transaction.status === 'Completed') {
      console.log('Transaction already completed');
      return NextResponse.json({ message: 'Transaction already completed' }, { status: 400 });
    }
    if (transaction.status === status) {
      console.log('Transaction already has this status');
      return NextResponse.json({ message: 'Transaction already has this status' }, { status: 400 });
    }
    // Handle balance transfer when completing
    if (status === 'Completed' && transaction.offer_id) {
      // Use DB transaction for atomicity
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        // Check buyer balance (must use conn.query here)
        const [[buyer]] = await conn.query('SELECT wallet_balance FROM users WHERE user_id = ?', [transaction.buyer_id]);
        const buyerBalance = parseFloat(buyer.wallet_balance);
        const txAmount = parseFloat(transaction.amount);
        console.log('SQL: SELECT wallet_balance FROM users WHERE user_id = ?', [transaction.buyer_id], 'Result:', buyer, 'buyerBalance:', buyerBalance, 'txAmount:', txAmount);
        if (!buyer || buyerBalance < txAmount) {
          await conn.rollback();
          console.log('Insufficient balance');
          return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }
        console.log('SQL: UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?', [txAmount, transaction.buyer_id]);
        await conn.query('UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?', [txAmount, transaction.buyer_id]);
        console.log('SQL: UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?', [txAmount, transaction.seller_id]);
        await conn.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?', [txAmount, transaction.seller_id]);
        console.log('SQL: UPDATE transactions SET status = ? WHERE transaction_id = ?', [status, transactionId]);
        await conn.query('UPDATE transactions SET status = ? WHERE transaction_id = ?', [status, transactionId]);
        console.log('SQL: UPDATE offers SET status = ? WHERE offer_id = ?', ['Completed', transaction.offer_id]);
        await conn.query('UPDATE offers SET status = ? WHERE offer_id = ?', ['Completed', transaction.offer_id]);
        await conn.commit();
        // Re-query transaction and balances for debug
        const [updatedTx] = await conn.query('SELECT * FROM transactions WHERE transaction_id = ?', [transactionId]);
        const [[updatedBuyer]] = await conn.query('SELECT wallet_balance FROM users WHERE user_id = ?', [transaction.buyer_id]);
        const [[updatedSeller]] = await conn.query('SELECT wallet_balance FROM users WHERE user_id = ?', [transaction.seller_id]);
        console.log('After commit, transaction:', updatedTx[0]);
        console.log('After commit, buyer balance:', updatedBuyer);
        console.log('After commit, seller balance:', updatedSeller);
      } catch (err) {
        await conn.rollback();
        console.error('Transaction failed, rolling back:', err);
        return NextResponse.json({ message: 'Transaction failed' }, { status: 500 });
      } finally {
        conn.release();
      }
      return NextResponse.json({ message: 'Transaction updated successfully' });
    } else {
      await pool.query('UPDATE transactions SET status = ? WHERE transaction_id = ?', [status, transactionId]);
      // If completing, also update offer status
      if (status === 'Completed' && transaction.offer_id) {
        await pool.query('UPDATE offers SET status = ? WHERE offer_id = ?', ['Completed', transaction.offer_id]);
      }
      return NextResponse.json({ message: 'Transaction updated successfully' });
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 