import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'توکن ادمین یافت نشد' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.isAdmin) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      admin: {
        username: decoded.username,
        isAdmin: true
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'توکن نامعتبر' },
      { status: 401 }
    );
  }
}