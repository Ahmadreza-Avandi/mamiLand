import mysql from 'mysql2/promise';

// تنظیمات دیتابیس
const dbConfig = {
  host: process.env.DB_HOST || '217.144.107.147',
  user: process.env.DB_USER || 'hxkxytfs_ahmad',
  password: process.env.DB_PASSWORD || 'Avan.1386',
  database: process.env.DB_NAME || 'hxkxytfs_mami',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 60000,
  ssl: {
    rejectUnauthorized: false
  }
};

// متغیر سراسری برای connection pool
let pool: mysql.Pool | null = null;

// تابع ایجاد connection pool
export async function getConnection() {
  if (!pool) {
    try {
      // استفاده از تنظیمات ساده برای pool
      pool = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        charset: dbConfig.charset,
        timezone: dbConfig.timezone,
        connectTimeout: dbConfig.connectTimeout,
        ssl: dbConfig.ssl,
        connectionLimit: 10,
        queueLimit: 0
      });
      
      console.log('✅ Connection pool به دیتابیس MySQL ایجاد شد');
    } catch (error) {
      console.error('❌ خطا در ایجاد connection pool:', error);
      throw error;
    }
  }
  return pool;
}

// تابع اجرای کوئری
export async function executeQuery(query: string, params: any[] = []) {
  let connection = null;
  
  try {
    // اگر pool وجود نداره، یک connection ساده ایجاد کن
    if (!pool) {
      connection = await mysql.createConnection(dbConfig);
      const [results] = await connection.execute(query, params);
      return results;
    } else {
      // استفاده از pool
      const [results] = await pool.execute(query, params);
      return results;
    }
  } catch (error) {
    console.error('❌ خطا در اجرای کوئری:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    // بستن connection اگر مستقیم ایجاد شده
    if (connection) {
      await connection.end();
    }
  }
}

// تابع بستن connection pool
export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Connection pool بسته شد');
  }
}
