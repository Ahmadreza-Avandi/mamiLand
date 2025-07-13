import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Admin Login] درخواست ورود ادمین دریافت شد');

    const body = await request.json();
    console.log('📝 [Admin Login] اطلاعات دریافتی:', {
      username: body.username,
      passwordLength: body.password?.length ?? 0,
    });

    const { username, password } = body;

    if (!username || !password) {
      console.warn('❌ [Admin Login] نام کاربری یا رمز عبور ناقص است');
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    console.log('🔍 [Admin Login] شروع اعتبارسنجی ادمین...');
    const isValid = await loginAdmin(username, password);
    console.log('📊 [Admin Login] نتیجه اعتبارسنجی:', isValid);

    if (!isValid) {
      console.warn('❌ [Admin Login] اعتبارسنجی ناموفق، نام کاربری یا رمز اشتباه است');
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نامعتبر است' },
        { status: 401 }
      );
    }

    console.log('✅ [Admin Login] اعتبارسنجی موفق - ساخت JWT...');
    let token;
    try {
      token = jwt.sign(
        { username, isAdmin: true },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('🎫 [Admin Login] توکن JWT ساخته شد');
    } catch (jwtError) {
      console.error('🔥 [Admin Login] خطا در ساخت توکن JWT:', jwtError);
      return NextResponse.json(
        { error: 'خطا در تولید توکن' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      admin: { username, isAdmin: true },
      token
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });
    console.log('🍪 [Admin Login] کوکی JWT تنظیم شد');

    console.log('🎉 [Admin Login] ورود ادمین با موفقیت انجام شد');
    return response;

  } catch (error) {
    console.error('💥 [Admin Login] خطای کلی سرور:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
