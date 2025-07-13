import { NextRequest, NextResponse } from 'next/server';
import { registerUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'نام کاربری باید حداقل ۳ کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }

    const user = await registerUser(username, email, password);
    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      token
    });

    // تنظیم کوکی JWT
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    return response;
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: error.message || 'خطای سرور' },
      { status: 500 }
    );
  }
}