import { NextRequest, NextResponse } from 'next/server';
import { deleteAccessCode } from '@/lib/auth';
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

// حذف کد دسترسی
export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    await deleteAccessCode(params.code);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting access code:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}