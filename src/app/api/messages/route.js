import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 发送新消息
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const senderId = session.user.id;
    const { receiver_id, content } = await request.json();
    if (!receiver_id || !content) {
      return NextResponse.json({ message: 'Receiver and content are required' }, { status: 400 });
    }
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiver_id, content]
    );
    return NextResponse.json({ message: 'Message sent successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 获取与某用户的消息历史
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('userId');
    if (!otherUserId) {
      return NextResponse.json([], { status: 200 });
    }
    const [messages] = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 标记消息为已读
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const receiverId = session.user.id;
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }
    await pool.query(
      'UPDATE messages SET is_read = true WHERE sender_id = ? AND receiver_id = ? AND is_read = false',
      [userId, receiverId]
    );
    return NextResponse.json({ message: 'Messages marked as read' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 