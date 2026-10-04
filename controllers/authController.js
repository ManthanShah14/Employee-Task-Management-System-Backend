import dotenv from 'dotenv'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'
import { getServerError } from '../global.js';

dotenv.config()

const cookieOptions = {
    httpOnly:true,
    secure:process.env.NODE_ENV === "production",
    sameSite:'strict',
    maxAge:900000 // 15 minutes
}

export const login = async(req,res)=>{
    try {
        const {email , password} = req.body;

        if(!email || !password){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        // check if user not exits
        const user = await pool.query("SELECT * FROM users WHERE email = $1" , [email])
        if(user.rows.length === 0){
            return res.status(401).json({message:"Invalid email or password"})
        }
        
        // User Data
        const userData = user.rows[0]
        const checkPassword = await bcrypt.compare(password , userData.password_hash)

        if(!checkPassword){
            return res.status(401).json({message:"Invalid email or password"})
        }

        // jwt token
        const token = jwt.sign({id:userData.id , role:userData.role} , process.env.JWT_SECRET  ,{expiresIn:'15m'})

        res.cookie('token' , token , cookieOptions)

        res.status(200).json({
            message:"user logged in successfully" , 
            name:userData.name, 
            email:userData.email, 
            role:userData.role, 
            department:userData.department,
        designation:userData.designation}
        )

    } catch (error) {  
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}

