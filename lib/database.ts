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
  acquireTimeout: 60000,
  timeout: 60000,
  ssl: {
    rejectUnauthorized: false
  }
};

// لاگ تنظیمات دیتابیس (بدون رمز عبور)
console.log('🔧 [DATABASE] تنظیمات دیتابیس:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  charset: dbConfig.charset,
  timezone: dbConfig.timezone,
  password: dbConfig.password ? '***' : 'undefined'
});

// متغیر سراسری برای connection pool
let pool: mysql.Pool | null = null;

// تابع ایجاد connection pool
export async function getConnection() {
  if (!pool) {
    try {
      console.log('🔄 [DATABASE] در حال ایجاد connection pool...');
      
      // استفاده از تنظیمات ساده برای pool
      pool = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        charset: dbConfig.charset,
        timezone: dbConfig.timezone,
        connectTimeout: dbConfig.connectTimeout,
        acquireTimeout: dbConfig.acquireTimeout,
        timeout: dbConfig.timeout,
        ssl: dbConfig.ssl,
        connectionLimit: 10,
        queueLimit: 0,
        reconnect: true,
        idleTimeout: 300000,
        maxIdle: 10
      });
      
      console.log('✅ Connection pool به دیتابیس MySQL ایجاد شد');
      
      // تست اتصال
      const testConnection = await pool.execute('SELECT 1 as test');
      console.log('✅ [DATABASE] تست اتصال pool موفق:', testConnection[0]);
      
    } catch (error) {
      console.error('❌ خطا در ایجاد connection pool:', error);
      if (error instanceof Error) {
        console.error('❌ پیام خطا:', error.message);
        console.error('❌ Stack trace:', error.stack);
      }
      throw error;
    }
  }
  return pool;
}

// تابع اجرای کوئری
export async function executeQuery(query: string, params: any[] = []) {
  let connection = null;
  
  try {
    console.log('📝 [DATABASE] اجرای کوئری:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    console.log('📝 [DATABASE] پارامترها:', params);
    
    // اگر pool وجود نداره، یک connection ساده ایجاد کن
    if (!pool) {
      console.log('🔗 [DATABASE] ایجاد connection مستقیم...');
      connection = await mysql.createConnection(dbConfig);
      const [results] = await connection.execute(query, params);
      console.log('✅ [DATABASE] کوئری با connection مستقیم موفق');
      return results;
    } else {
      // استفاده از pool
      console.log('🏊 [DATABASE] استفاده از pool...');
      const [results] = await pool.execute(query, params);
      console.log('✅ [DATABASE] کوئری با pool موفق');
      return results;
    }
  } catch (error) {
    console.error('❌ خطا در اجرای کوئری:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    
    if (error instanceof Error) {
      console.error('❌ پیام خطا:', error.message);
      console.error('❌ کد خطا:', (error as any).code);
      console.error('❌ errno:', (error as any).errno);
      console.error('❌ sqlState:', (error as any).sqlState);
    }
    
    throw error;
  } finally {
    // بستن connection اگر مستقیم ایجاد شده
    if (connection) {
      console.log('🔌 [DATABASE] بستن connection مستقیم');
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
