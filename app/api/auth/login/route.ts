import { NextRequest, NextResponse } from 'next/server';
import { loginUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [LOGIN] درخواست لاگین دریافت شد');

    const body = await request.json();
    console.log('📥 [LOGIN] اطلاعات دریافتی از کلاینت:', body);

    const { username, password } = body;

    if (!username || !password) {
      console.warn('⚠️ [LOGIN] اطلاعات ناقص: username یا password خالیه');
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    console.log('🔐 [LOGIN] بررسی اعتبار کاربر...');
    const user = await loginUser(username, password);
    console.log('📊 [LOGIN] نتیجه بررسی کاربر:', user);

    if (!user) {
      console.warn('❌ [LOGIN] نام کاربری یا رمز اشتباهه');
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نامعتبر است' },
        { status: 401 }
      );
    }

    console.log('✅ [LOGIN] کاربر معتبره، ساخت توکن...');
    const token = generateToken(user);
    console.log('🎫 [LOGIN] توکن ساخته شد:', token);

    const response = NextResponse.json({
      success: true,
      user,
      token
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    console.log('🍪 [LOGIN] کوکی تنظیم شد');

    return response;
  } catch (error) {
    console.error('💥 [LOGIN] خطای کلی در ورود کاربر:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
