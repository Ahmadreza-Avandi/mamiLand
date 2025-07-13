import mysql from 'mysql2/promise';

// تنظیمات اتصال به دیتابیس MySQL
const dbConfig = {
  host: process.env.DB_HOST || '217.144.107.147',
  user: process.env.DB_USER || 'hxkxytfs_ahmad',
  password: process.env.DB_PASSWORD || 'Avan.1386',
  database: process.env.DB_NAME || 'hxkxytfs_mami',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 60000,
  ssl: {
    rejectUnauthorized: false,
  },
};

// استفاده از Connection Pool برای بهبود عملکرد در سرورهای Serverless مانند Vercel
let pool: mysql.Pool;

/**
 * دریافت یا ایجاد Connection Pool
 * @returns {Promise<mysql.Pool>} اتصال Pool
 */
export async function getPool(): Promise<mysql.Pool> {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('✅ Connection pool به دیتابیس MySQL ایجاد شد');
  }
  return pool;
}

/**
 * اجرای کوئری روی دیتابیس
 * @param {string} query متن کوئری SQL
 * @param {any[]} params پارامترهای کوئری
 * @returns {Promise<any>} نتایج کوئری
 */
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  try {
    const pool = await getPool();
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ خطا در اجرای کوئری:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * بستن Connection Pool (در صورت نیاز)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('🔌 Connection pool بسته شد');
  }
}
