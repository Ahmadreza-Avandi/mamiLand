import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { sendToAI } from '@/lib/chat';
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

    const { message, messages, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'پیام الزامی است' },
        { status: 400 }
      );
    }

    const user = await getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // ارسال به هوش مصنوعی
    const reply = await sendToAI(messages, user.profile);

    // به‌روزرسانی عنوان جلسه اگر اولین پیام است
    if (sessionId && messages.length <= 2) {
      const shortTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
      await executeQuery(
        'UPDATE chat_sessions SET title = ? WHERE id = ?',
        [shortTitle, sessionId]
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}