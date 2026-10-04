import { Pool } from "pg";
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
})

pool.on('connect', () => {
    console.log("Database connected Successfully")
})

pool.on('error', (err) => {
    console.error("Database connection error", err)
})

export default pool