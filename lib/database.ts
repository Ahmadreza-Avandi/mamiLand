import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '217.144.107.147',
  user: process.env.DB_USER || 'hxkxytfs_ahmad',
  password: process.env.DB_PASSWORD || 'Avan.1386',
  database: process.env.DB_NAME || 'hxkxytfs_mami',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 60000,
  timeout: 60000,
  // تنظیمات اضافی برای اتصال خارجی
  ssl: {
    rejectUnauthorized: false
  }
};

// استفاده از connection pool برای Vercel
let pool: mysql.Pool | null = null;

export async function getConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        ...dbConfig,
        connectionLimit: 10,
        queueLimit: 0,
        timeout: 60000,
        reconnect: true
      });
      console.log('✅ Connection pool به دیتابیس MySQL ایجاد شد');
    } catch (error) {
      console.error('❌ خطا در ایجاد connection pool:', error);
      throw error;
    }
  }
  return pool;
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const pool = await getConnection();
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ خطا در اجرای کوئری:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// برای Vercel نیازی به close connection نیست
export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Connection pool بسته شد');
  }
}
