import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
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

    const { sessionId, content, role } = await request.json();

    if (!sessionId || !content || !role) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص' },
        { status: 400 }
      );
    }

    // ذخیره پیام در دیتابیس
    const result: any = await executeQuery(
      'INSERT INTO chat_messages (session_id, user_id, content, role) VALUES (?, ?, ?, ?)',
      [sessionId, decoded.userId, content, role]
    );

    // به‌روزرسانی زمان آخرین فعالیت جلسه
    await executeQuery(
      'UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?',
      [sessionId]
    );

    return NextResponse.json({ 
      success: true, 
      messageId: result.insertId 
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}