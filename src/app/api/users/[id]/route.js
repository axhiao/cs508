import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
    const p = await params;
    const userId = p.id;
    if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    try {
    const [users] = await pool.query('SELECT user_id, username, wallet_balance FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(users[0]);
    } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 