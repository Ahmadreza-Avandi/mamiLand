// lib/database.ts
import { createPool, Pool, PoolOptions } from 'mysql2/promise';

const poolConfig: PoolOptions = {
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
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = createPool(poolConfig);
    console.log('✅ Connection pool به دیتابیس MySQL ایجاد شد');
  }
  return pool;
}

export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  try {
    const db = getPool();
    const [results] = await db.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ خطا در اجرای کوئری:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('🔌 Connection pool بسته شد');
    pool = null;
  }
}

