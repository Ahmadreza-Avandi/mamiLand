import { NextRequest, NextResponse } from 'next/server';
import { getAllAccessCodes, generateAccessCode } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

// بررسی احراز هویت ادمین
function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.isAdmin;
  } catch {
    return false;
  }
}

// دریافت تمام کدهای دسترسی
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    const codes = await getAllAccessCodes();
    return NextResponse.json({ codes });
  } catch (error) {
    console.error('Error getting access codes:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// تولید کد دسترسی جدید
export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    const newCode = await generateAccessCode();
    return NextResponse.json({ code: newCode });
  } catch (error) {
    console.error('Error generating access code:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}