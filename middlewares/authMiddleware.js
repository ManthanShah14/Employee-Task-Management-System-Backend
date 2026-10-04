import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

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
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const isEmployee = async(req,res,next)=>{
    try {
         const token = req.cookies.token
        if(!token){
            return res.status(401).json({message:"unauthoried , token required"})
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        const role = decoded.role

        if(role !== 'employee'){
            return res.status(403).json({message:"Only Employee can access"})
        }
        
        req.id = decoded.id
        
        next()
    } catch (error) {
         getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}