import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';

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

    const user = await getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی انقضای حساب کاربری (یک ماه)
    const accountCreated = new Date(user.created_at);
    const oneMonthLater = new Date(accountCreated);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    if (new Date() > oneMonthLater) {
      // حساب منقضی شده - حذف توکن
      const response = NextResponse.json(
        { error: 'حساب کاربری شما منقضی شده است. لطفاً کد دسترسی جدید دریافت کنید.' },
        { status: 401 }
      );
      
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0
      });
      
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}