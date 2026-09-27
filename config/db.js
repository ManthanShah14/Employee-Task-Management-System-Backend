import { Pool } from "pg";
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
    user:process.env.USER,
    password:process.env.PASSWORD,
    host:process.env.HOST,
    port:process.env.DB_PORT,
    database:process.env.DATABASE
})

pool.on('connect' , ()=>{
    console.log("Database connected Successfully")
})

pool.on('error' , (err)=>{
    console.log("Database connection error" , err)
})

export default pool