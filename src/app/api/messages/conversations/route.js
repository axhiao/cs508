import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    // Get all conversations with the latest message and unread count
    const [conversations] = await pool.query(
      `WITH LatestMessages AS (
        SELECT 
          CASE 
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END as other_user_id,
          content as last_message,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY 
              CASE 
                WHEN sender_id = ? THEN receiver_id
                ELSE sender_id
              END
            ORDER BY created_at DESC
          ) as rn
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
      )
      SELECT 
        u.user_id,
        u.username,
        lm.last_message,
        lm.created_at as last_message_time,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.sender_id = u.user_id
            AND m.receiver_id = ?
            AND m.is_read = false
        ) as unread_count
      FROM LatestMessages lm
      JOIN users u ON u.user_id = lm.other_user_id
      WHERE lm.rn = 1 AND u.user_id != ?
      ORDER BY lm.created_at DESC`,
      [userId, userId, userId, userId, userId, userId]
    );
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 