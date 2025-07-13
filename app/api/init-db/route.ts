import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST() {
  console.log('🚀 [INIT-DB] شروع مقداردهی اولیه دیتابیس...');
  
  try {
    // ایجاد جدول admins
    console.log('👤 [INIT-DB] ایجاد جدول admins...');
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

    // ایجاد جدول users
    console.log('👥 [INIT-DB] ایجاد جدول users...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ایجاد جدول user_profiles
    console.log('📝 [INIT-DB] ایجاد جدول user_profiles...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) DEFAULT '',
        age INT NULL,
        is_pregnant BOOLEAN NULL,
        pregnancy_week INT NULL,
        medical_conditions TEXT NULL,
        user_group VARCHAR(50) NULL,
        is_complete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ایجاد جدول access_codes
    console.log('🔑 [INIT-DB] ایجاد جدول access_codes...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS access_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        used_by INT NULL,
        used_at TIMESTAMP NULL,
        FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ایجاد جدول chat_sessions
    console.log('💬 [INIT-DB] ایجاد جدول chat_sessions...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) DEFAULT 'چت جدید',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ایجاد جدول chat_messages
    console.log('📨 [INIT-DB] ایجاد جدول chat_messages...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // اضافه کردن ادمین پیش‌فرض
    console.log('👤 [INIT-DB] اضافه کردن ادمین پیش‌فرض...');
    await executeQuery(
      'INSERT IGNORE INTO admins (username, password_hash, is_active) VALUES (?, ?, TRUE)',
      ['admin', 'admin123']
    );

    // اضافه کردن چند کد دسترسی نمونه
    console.log('🎫 [INIT-DB] اضافه کردن کدهای دسترسی نمونه...');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const sampleCodes = ['ABC123', 'XYZ789', 'DEF456'];
    for (const code of sampleCodes) {
      await executeQuery(
        'INSERT IGNORE INTO access_codes (code, expires_at) VALUES (?, ?)',
        [code, expiresAt]
      );
    }

    console.log('✅ [INIT-DB] مقداردهی اولیه دیتابیس با موفقیت انجام شد');

    return NextResponse.json({
      success: true,
      message: 'دیتابیس با موفقیت مقداردهی شد',
      data: {
        adminCreated: true,
        sampleCodesCreated: sampleCodes.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 [INIT-DB] خطا در مقداردهی دیتابیس:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطا در مقداردهی دیتابیس',
      details: error instanceof Error ? error.message : 'خطای نامشخص',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}