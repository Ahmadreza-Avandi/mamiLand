import { NextRequest, NextResponse } from 'next/server';
import { validateAccessCode } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'کد دسترسی الزامی است' },
        { status: 400 }
      );
    }

    const isValid = await validateAccessCode(code);

    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'کد دسترسی نامعتبر یا منقضی شده است' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error validating access code:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}