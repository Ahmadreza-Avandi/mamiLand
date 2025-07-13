import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [ADMIN-LOGIN] درخواست ورود ادمین دریافت شد');
    console.log('🌍 [ADMIN-LOGIN] محیط اجرا:', process.env.NODE_ENV);
    console.log('🔧 [ADMIN-LOGIN] متغیرهای محیطی موجود:', {
      DB_HOST: process.env.DB_HOST || 'undefined',
      DB_USER: process.env.DB_USER || 'undefined',
      DB_NAME: process.env.DB_NAME || 'undefined',
      JWT_SECRET: process.env.JWT_SECRET ? 'موجود' : 'undefined'
    });

    const body = await request.json();
    console.log('📝 [ADMIN-LOGIN] اطلاعات دریافتی:', {
      username: body.username,
      passwordLength: body.password?.length ?? 0,
    });

    const { username, password } = body;

    if (!username || !password) {
      console.warn('⚠️ [ADMIN-LOGIN] نام کاربری یا رمز عبور ناقص است');
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    let isValid: boolean;
    try {
      console.log('🔍 [ADMIN-LOGIN] شروع اعتبارسنجی ادمین...');
      isValid = await loginAdmin(username, password);
      console.log('📊 [ADMIN-LOGIN] نتیجه اعتبارسنجی:', isValid);
    } catch (authErr) {
      console.error('🔥 [ADMIN-LOGIN] خطا در تابع loginAdmin:', authErr);
      if (authErr instanceof Error) {
        console.error('🔥 authErr.message:', authErr.message);
        console.error('🔥 authErr.stack:', authErr.stack);
      }
      return NextResponse.json(
        { error: 'خطا در بررسی اعتبار کاربر' },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.warn('❌ [ADMIN-LOGIN] اعتبارسنجی ناموفق، نام کاربری یا رمز اشتباه است');
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نامعتبر است' },
        { status: 401 }
      );
    }

    let token: string;
    try {
      console.log('✅ [ADMIN-LOGIN] اعتبارسنجی موفق - ساخت JWT...');
      token = jwt.sign(
        { username, isAdmin: true },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('🎫 [ADMIN-LOGIN] توکن JWT ساخته شد (طول):', token.length);
    } catch (jwtErr) {
      console.error('🔥 [ADMIN-LOGIN] خطا در ساخت توکن JWT:', jwtErr);
      if (jwtErr instanceof Error) {
        console.error('🔥 jwtErr.message:', jwtErr.message);
        console.error('🔥 jwtErr.stack:', jwtErr.stack);
      }
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

    try {
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 روز
      });
      console.log('🍪 [ADMIN-LOGIN] کوکی JWT تنظیم شد');
    } catch (cookieErr) {
      console.error('⚠️ [ADMIN-LOGIN] خطا در ست کردن کوکی:', cookieErr);
    }

    console.log('🎉 [ADMIN-LOGIN] ورود ادمین با موفقیت انجام شد');
    return response;

  } catch (error) {
    console.error('💥 [ADMIN-LOGIN] خطای کلی سرور:', error);
    if (error instanceof Error) {
      console.error('💥 error.message:', error.message);
      console.error('💥 error.stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
