import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    console.log('🕵️‍♂️ [DEBUG-DB] در حال واکشی دیتا از دیتابیس...');

    // مثال: واکشی همه یوزرها و همه ادمین‌ها
    const users: any[] = await executeQuery('SELECT * FROM users ORDER BY id DESC');
    const admins: any[] = await executeQuery('SELECT * FROM admins ORDER BY id DESC');

    console.log(`✅ [DEBUG-DB] کاربران: ${users.length} تا، ادمین‌ها: ${admins.length} تا`);
    return NextResponse.json({ users, admins }, { status: 200 });
  } catch (error) {
    console.error('💥 [DEBUG-DB] خطا هنگام واکشی دیتابیس:', error);
    // اگه Error باشه جزئیاتشو بده
    if (error instanceof Error) {
      console.error('💥 message:', error.message);
      console.error('💥 stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'خطا در واکشی دیتابیس', details: (error as any).message || null },
      { status: 500 }
    );
  }
}
