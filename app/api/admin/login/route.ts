import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 درخواست ورود ادمین دریافت شد');
    
    const { username, password } = await request.json();
    console.log('📝 اطلاعات دریافتی:', { username, passwordLength: password?.length });

    if (!username || !password) {
      console.log('❌ اطلاعات ناقص');
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    console.log('🔍 شروع بررسی اعتبار ادمین...');
    const isValid = await loginAdmin(username, password);
    console.log('📊 نتیجه بررسی:', isValid);

    if (!isValid) {
      console.log('❌ ورود ناموفق');
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نامعتبر است' },
        { status: 401 }
      );
    }

    console.log('✅ ورود موفق - تولید توکن...');
    
    // تولید JWT برای ادمین
    const token = jwt.sign(
      { username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎫 توکن تولید شد');

    const response = NextResponse.json({
      success: true,
      admin: { username, isAdmin: true },
      token
    });

    // تنظیم کوکی JWT برای ادمین
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    console.log('🍪 کوکی تنظیم شد');
    console.log('🎉 ورود ادمین کامل شد');

    return response;
  } catch (error) {
    console.error('💥 خطای سرور در ورود ادمین:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}