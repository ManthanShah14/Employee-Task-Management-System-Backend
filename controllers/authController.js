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

export const changePassword = async (req,res) => {
    try {
       const userId = req.id

        const {oldPassword, newPassword } = req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({message:"Invalid Credentials."})
        }

        const user = await pool.query("SELECT password_hash FROM users WHERE id = $1 AND state = 'active'",[userId])

        if(user.rows.length === 0){
            return res.status(404).json({message:"User not found."})
        }

        const userData = user.rows[0]

        const verifyRightPassword = await bcrypt.compare(oldPassword , userData.password_hash)

        if(!verifyRightPassword){
            return res.status(400).json({message:"Old password is incorrect , Please write correct password."})
        }

        if(oldPassword === newPassword){
            return res.status(409).json({message:"New Password should be different."})
        }

        const saltRounds = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword , saltRounds)

        const updated = await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email, role, department, designation" , [hashedPassword , userId])

        res.status(200).json({message:"Password Changed Successfully." , user:updated.rows[0]})

    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const logout = async (req,res) => {
    try {
        const token = req.cookies.token
       if(!token){
        return res.status(409).json({message:"User is not logged In."})
       }

       res.clearCookie('token' , cookieOptions)
       res.status(200).json({message:"User logged out successfully."})
        
    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}