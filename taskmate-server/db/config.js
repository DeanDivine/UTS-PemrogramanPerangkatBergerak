import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
port: 3307,
waitForConnections: true,
connectionLimit: 10
});

pool.getConnection()
  .then(conn => {
    console.log('✅ DB connected');
    conn.release();
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
  });
