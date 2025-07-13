import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'توکن یافت نشد' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const sessionId = parseInt(params.sessionId);

    // بررسی اینکه جلسه متعلق به کاربر است
    const sessionCheck: any = await executeQuery(
      'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, decoded.userId]
    );

    if (sessionCheck.length === 0) {
      return NextResponse.json(
        { error: 'جلسه یافت نشد' },
        { status: 404 }
      );
    }

    // دریافت پیام‌های جلسه
    const messages: any = await executeQuery(
      'SELECT id, content, role, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}