import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;
    const params = await context.params;
    const listingId = params.id;

    // 检查物品是否存在且属于当前用户
    const [rows] = await pool.query('SELECT seller_id FROM listings WHERE listing_id = ?', [listingId]);
    if (!rows.length) {
      return NextResponse.json({ message: 'Listing not found' }, { status: 404 });
    }
    if (rows[0].seller_id !== userId) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    // 删除物品
    await pool.query('DELETE FROM listings WHERE listing_id = ?', [listingId]);
    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 