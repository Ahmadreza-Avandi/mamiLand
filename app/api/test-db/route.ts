import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  console.log('🚀 [TEST-DB] شروع تست اتصال دیتابیس...');
  
  try {
    // تست اتصال ساده
    console.log('📡 [TEST-DB] تست اتصال ساده...');
    const testConnection = await executeQuery('SELECT 1 as test');
    console.log('✅ [TEST-DB] اتصال ساده موفق:', testConnection);

    // تست جداول موجود
    console.log('📋 [TEST-DB] بررسی جداول موجود...');
    const tables = await executeQuery('SHOW TABLES');
    console.log('📊 [TEST-DB] جداول موجود:', tables);

    // تست جدول admins
    console.log('👤 [TEST-DB] بررسی جدول admins...');
    try {
      const admins = await executeQuery('SELECT id, username, is_active FROM admins LIMIT 5');
      console.log('👥 [TEST-DB] ادمین‌های موجود:', admins);
    } catch (adminError) {
      console.error('❌ [TEST-DB] خطا در خواندن جدول admins:', adminError);
    }

    // تست جدول users
    console.log('👥 [TEST-DB] بررسی جدول users...');
    try {
      const users = await executeQuery('SELECT id, username, email, created_at FROM users LIMIT 5');
      console.log('👤 [TEST-DB] کاربران موجود:', users);
    } catch (userError) {
      console.error('❌ [TEST-DB] خطا در خواندن جدول users:', userError);
    }

    // تست جدول access_codes
    console.log('🔑 [TEST-DB] بررسی جدول access_codes...');
    try {
      const codes = await executeQuery('SELECT code, is_used, expires_at FROM access_codes LIMIT 5');
      console.log('🎫 [TEST-DB] کدهای دسترسی موجود:', codes);
    } catch (codeError) {
      console.error('❌ [TEST-DB] خطا در خواندن جدول access_codes:', codeError);
    }

    // تست متغیرهای محیطی
    console.log('🔧 [TEST-DB] بررسی متغیرهای محیطی...');
    const envVars = {
      DB_HOST: process.env.DB_HOST || 'undefined',
      DB_USER: process.env.DB_USER || 'undefined',
      DB_NAME: process.env.DB_NAME || 'undefined',
      DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'undefined',
      JWT_SECRET: process.env.JWT_SECRET ? '***' : 'undefined',
      LANGCHAIN_API_URL: process.env.LANGCHAIN_API_URL || 'undefined',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    };
    console.log('⚙️ [TEST-DB] متغیرهای محیطی:', envVars);

    return NextResponse.json({
      success: true,
      message: 'اتصال دیتابیس موفق!',
      data: {
        connectionTest: testConnection,
        tablesCount: Array.isArray(tables) ? tables.length : 0,
        tables: tables,
        environment: envVars,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 [TEST-DB] خطای کلی در تست دیتابیس:', error);
    
    if (error instanceof Error) {
      console.error('💥 [TEST-DB] پیام خطا:', error.message);
      console.error('💥 [TEST-DB] Stack trace:', error.stack);
    }

    return NextResponse.json({
      success: false,
      error: 'خطا در اتصال دیتابیس',
      details: error instanceof Error ? error.message : 'خطای نامشخص',
      environment: {
        DB_HOST: process.env.DB_HOST || 'undefined',
        DB_USER: process.env.DB_USER || 'undefined',
        DB_NAME: process.env.DB_NAME || 'undefined',
        NODE_ENV: process.env.NODE_ENV || 'undefined'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}