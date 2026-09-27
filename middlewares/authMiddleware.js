import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import pool from '../config/db.js'

dotenv.config()

export const isAdmin = async(req , res , next)=>{
    try {
        const token = req.cookies.token
        if(!token){
            return res.status(401).json({message:"unauthoried , token required"})
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        const role = decoded.role

        if(role !== 'admin'){
            return res.status(403).json({message:"Only admin can access"})
        }
        
        next()
        
    } catch (error) {
        console.log(error);
        
        res.status(500).json({error:error , message:"Server error"})
    }
}