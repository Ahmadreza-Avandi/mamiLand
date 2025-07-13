import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
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

    // دریافت جلسات چت کاربر
    const sessions: any = await executeQuery(
      `SELECT 
        cs.id, 
        cs.title, 
        cs.created_at,
        COUNT(cm.id) as message_count
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cs.id = cm.session_id
      WHERE cs.user_id = ? AND cs.is_active = TRUE
      GROUP BY cs.id, cs.title, cs.created_at
      ORDER BY cs.updated_at DESC`,
      [decoded.userId]
    );

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}

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

    const { title } = await request.json();

    // ایجاد جلسه چت جدید
    const result: any = await executeQuery(
      'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
      [decoded.userId, title || 'چت جدید']
    );

    return NextResponse.json({ 
      success: true, 
      sessionId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}