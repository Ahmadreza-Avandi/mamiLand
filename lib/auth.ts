import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  name: string;
  age: number | null;
  is_pregnant: boolean | null;
  pregnancy_week: number | null;
  medical_conditions: string | null;
  user_group: string | null;
  is_complete: boolean;
}

export interface AccessCode {
  id: number;
  code: string;
  created_at: Date;
  expires_at: Date;
  is_used: boolean;
  used_by: number | null;
  used_at: Date | null;
}

// تولید کد دسترسی جدید
export async function generateAccessCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await executeQuery(
    'INSERT INTO access_codes (code, expires_at) VALUES (?, ?)',
    [code, expiresAt]
  );

  return code;
}

// بررسی صحت کد دسترسی
export async function validateAccessCode(code: string): Promise<boolean> {
  const results: any = await executeQuery(
    'SELECT * FROM access_codes WHERE code = ? AND is_used = FALSE AND expires_at > NOW()',
    [code.toUpperCase()]
  );

  if (results.length > 0) {
    await executeQuery(
      'UPDATE access_codes SET is_used = TRUE, used_at = NOW() WHERE code = ?',
      [code.toUpperCase()]
    );
    return true;
  }
  return false;
}

// ثبت نام کاربر جدید - بدون هش کردن رمز عبور
export async function registerUser(username: string, email: string, password: string): Promise<User> {
  // بررسی وجود نام کاربری یا ایمیل
  const existingUser: any = await executeQuery(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  if (existingUser.length > 0) {
    if (existingUser[0].username === username) {
      throw new Error('این نام کاربری قبلاً ثبت شده است');
    }
    if (existingUser[0].email === email) {
      throw new Error('این ایمیل قبلاً ثبت شده است');
    }
  }

  // ذخیره رمز عبور بدون هش (طبق درخواست شما)
  const result: any = await executeQuery(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, password]
  );

  const userId = result.insertId;

  // ایجاد پروفایل خالی
  await executeQuery(
    'INSERT INTO user_profiles (user_id, name, is_complete) VALUES (?, ?, FALSE)',
    [userId, '']
  );

  return {
    id: userId,
    username,
    email,
    created_at: new Date()
  };
}

// ورود کاربر - بدون بررسی هش
export async function loginUser(username: string, password: string): Promise<User | null> {
  const results: any = await executeQuery(
    'SELECT u.*, p.name, p.age, p.is_pregnant, p.pregnancy_week, p.medical_conditions, p.user_group, p.is_complete FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.username = ? OR u.email = ?',
    [username, username]
  );

  if (results.length === 0) {
    return null;
  }

  const user = results[0];
  
  // مقایسه مستقیم رمز عبور (بدون هش)
  if (user.password_hash !== password) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    profile: {
      name: user.name || '',
      age: user.age,
      is_pregnant: user.is_pregnant,
      pregnancy_week: user.pregnancy_week,
      medical_conditions: user.medical_conditions,
      user_group: user.user_group,
      is_complete: user.is_complete || false
    }
  };
}

// تولید JWT Token
export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// تأیید JWT Token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// دریافت اطلاعات کاربر از طریق ID
export async function getUserById(userId: number): Promise<User | null> {
  const results: any = await executeQuery(
    'SELECT u.*, p.name, p.age, p.is_pregnant, p.pregnancy_week, p.medical_conditions, p.user_group, p.is_complete FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?',
    [userId]
  );

  if (results.length === 0) {
    return null;
  }

  const user = results[0];
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    profile: {
      name: user.name || '',
      age: user.age,
      is_pregnant: user.is_pregnant,
      pregnancy_week: user.pregnancy_week,
      medical_conditions: user.medical_conditions,
      user_group: user.user_group,
      is_complete: user.is_complete || false
    }
  };
}

// به‌روزرسانی پروفایل کاربر
export async function updateUserProfile(userId: number, profile: Partial<UserProfile>): Promise<void> {
  const setClause = [];
  const values = [];

  if (profile.name !== undefined) {
    setClause.push('name = ?');
    values.push(profile.name);
  }
  if (profile.age !== undefined) {
    setClause.push('age = ?');
    values.push(profile.age);
  }
  if (profile.is_pregnant !== undefined) {
    setClause.push('is_pregnant = ?');
    values.push(profile.is_pregnant);
  }
  if (profile.pregnancy_week !== undefined) {
    setClause.push('pregnancy_week = ?');
    values.push(profile.pregnancy_week);
  }
  if (profile.medical_conditions !== undefined) {
    setClause.push('medical_conditions = ?');
    values.push(profile.medical_conditions);
  }
  if (profile.user_group !== undefined) {
    setClause.push('user_group = ?');
    values.push(profile.user_group);
  }
  if (profile.is_complete !== undefined) {
    setClause.push('is_complete = ?');
    values.push(profile.is_complete);
  }

  if (setClause.length > 0) {
    values.push(userId);
    await executeQuery(
      `UPDATE user_profiles SET ${setClause.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
      values
    );
  }
}

// دریافت تمام کدهای دسترسی
export async function getAllAccessCodes(): Promise<AccessCode[]> {
  const results: any = await executeQuery(
    'SELECT * FROM access_codes ORDER BY created_at DESC'
  );
  return results;
}

// حذف کد دسترسی
export async function deleteAccessCode(code: string): Promise<void> {
  await executeQuery('DELETE FROM access_codes WHERE code = ?', [code]);
}

// دریافت تمام کاربران
export async function getAllUsers(): Promise<User[]> {
  const results: any = await executeQuery(
    'SELECT u.*, p.name, p.age, p.is_pregnant, p.pregnancy_week, p.medical_conditions, p.user_group, p.is_complete FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id ORDER BY u.created_at DESC'
  );

  return results.map((user: any) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    profile: {
      name: user.name || '',
      age: user.age,
      is_pregnant: user.is_pregnant,
      pregnancy_week: user.pregnancy_week,
      medical_conditions: user.medical_conditions,
      user_group: user.user_group,
      is_complete: user.is_complete || false
    }
  }));
}

// حذف کاربر
export async function deleteUser(userId: number): Promise<void> {
  await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
}

// ورود ادمین - بدون هش
export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    console.log('🔍 [AUTH] تلاش ورود ادمین:', { username });
    console.log('🔍 [AUTH] رمز عبور دریافتی (طول):', password.length);
    
    // ابتدا تست اتصال دیتابیس
    console.log('🔗 [AUTH] تست اتصال دیتابیس...');
    await executeQuery('SELECT 1 as test');
    console.log('✅ [AUTH] اتصال دیتابیس موفق');
    
    // بررسی وجود جدول admins
    console.log('📋 [AUTH] بررسی جدول admins...');
    const tableCheck = await executeQuery('SHOW TABLES LIKE "admins"');
    console.log('📊 [AUTH] نتیجه بررسی جدول admins:', tableCheck);
    
    if (!Array.isArray(tableCheck) || tableCheck.length === 0) {
      console.error('❌ [AUTH] جدول admins وجود ندارد!');
      
      // تلاش برای ایجاد جدول admins
      console.log('🔨 [AUTH] تلاش برای ایجاد جدول admins...');
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // اضافه کردن ادمین پیش‌فرض
      console.log('👤 [AUTH] اضافه کردن ادمین پیش‌فرض...');
      await executeQuery(
        'INSERT IGNORE INTO admins (username, password_hash, is_active) VALUES (?, ?, TRUE)',
        ['admin', '1']
      );
      
      console.log('✅ [AUTH] جدول admins ایجاد شد و ادمین پیش‌فرض اضافه شد');
    }
    
    // جستجوی ادمین
    console.log('🔍 [AUTH] جستجوی ادمین در دیتابیس...');
    const results: any = await executeQuery(
      'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
      [username]
    );

    console.log('📊 [AUTH] نتایج جستجو ادمین:', results.length);
    
    if (results.length > 0) {
      console.log('👤 [AUTH] ادمین پیدا شد:', {
        id: results[0].id,
        username: results[0].username,
        is_active: results[0].is_active,
        created_at: results[0].created_at
      });
    }

    if (results.length === 0) {
      console.log('❌ [AUTH] ادمین یافت نشد');
      
      // نمایش تمام ادمین‌های موجود برای دیباگ
      console.log('🔍 [AUTH] نمایش تمام ادمین‌های موجود...');
      const allAdmins = await executeQuery('SELECT id, username, is_active FROM admins');
      console.log('👥 [AUTH] تمام ادمین‌ها:', allAdmins);
      
      return false;
    }

    const admin = results[0];
    console.log('👤 [AUTH] ادمین پیدا شد:', { id: admin.id, username: admin.username });
    
    // مقایسه مستقیم رمز عبور (بدون هش)
    console.log('🔐 [AUTH] مقایسه رمز عبور...');
    console.log('🔐 [AUTH] رمز ذخیره شده:', admin.password_hash);
    console.log('🔐 [AUTH] رمز دریافتی:', password);
    const isValidPassword = admin.password_hash === password;
    console.log('🔐 [AUTH] نتیجه بررسی رمز عبور:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ [AUTH] رمز عبور نامعتبر');
      return false;
    }

    console.log('✅ [AUTH] ورود ادمین موفق');
    return true;
  } catch (error) {
    console.error('❌ [AUTH] خطا در ورود ادمین:', error);
    if (error instanceof Error) {
      console.error('❌ [AUTH] پیام خطا:', error.message);
      console.error('❌ [AUTH] Stack trace:', error.stack);
    }
    return false;
  }
}

// تولید هش رمز عبور برای تست
export async function generatePasswordHash(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}