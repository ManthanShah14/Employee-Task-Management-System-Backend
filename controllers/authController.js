import dotenv from 'dotenv'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'

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
        res.status(500).json({error:error , message:"Server error"})
    }
}

export const createEmoloyee = async(req,res)=>{
    try {
        const {name , email , password  , department , designation} = req.body;

        if(!name || !email || !password || !department || !designation){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        const saltRounds = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password , saltRounds)

        const newEmployee = await pool.query("INSERT INTO users(name , email , password_hash , department , designation) VALUES($1 , $2 , $3 , $4 , $5) RETURNING name  ,email , department , designation",[name , email , hashedPassword , department , designation])

        return res.status(201).json({message:"Employee created successfully" , user:newEmployee.rows[0]})
        
    } catch (error) {
        res.status(500).json({error:error , message:"Server error"})
    }
}

export const getAllEmployees = async (req,res) => {
    try {
        const employees = await pool.query("SELECT name,email,role,department,designation FROM users WHERE role = 'employee' AND state = 'active'")
        
        return res.status(200).json({message:"Employess Fetched Successfully" , employees:employees.rows})
        
    } catch (error) {
        res.status(500).json({error:error , message:"Server error"})
    }
}

export const getEmployeeById = async (req , res) => {
    try {
        const userId = req.params.id;
        
        if(isNaN(userId)){
            return res.status(400).json({message:"user ID should be integer."})
        }
        
        const employee = await pool.query("SELECT name,email,role,department,designation FROM users WHERE role='employee' AND state='active' AND id=$1",[userId])

        if(employee.rows.length === 0){
            return res.status(404).json({message:"no such user found on this given id."})
        }

        res.status(200).json({message:"Employee fetched successfully" , employee:employee.rows[0]})

    } catch (error) {
        console.log(error);
        
        res.status(500).json({error:error , message:"Server error"})
    }
}

export const updateEmployee = async (req,res) => {
    try {
        const userId = req.params.id;

         if(isNaN(userId)){
            return res.status(400).json({message:"user ID should be integer."})
        }

        const data = req.body;

        if(!data){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        const entries = Object.entries(data);

        const column_name = entries.map(([key , _])=> key).join(", ")
        const setClause = entries.map(([key , _] , idx)=> `${key} = $${idx + 1}`).join(", ")
        const values = entries.map(([_ , value])=>value);
        values.push(userId)

        const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING ${column_name}`

        const update = await pool.query(query , values)

        if(update.rows.length === 0){
            return res.status(401).json({message:"no such user found on this given id."})
        }
        
        res.status(200).json({message:"Employee Updated Successfully" , user:update.rows[0]})
        
    } catch (error) {
        res.status(500).json({error:error , message:"Server error"})
    }
}

export const deactivateEmployee = async (req,res) => {
    try {
        const userId = req.params.id

        if(isNaN(userId)){
            return res.status(400).json({message:"user ID should be integer."})
        }

        const user = await pool.query("SELECT name, email, role, department, designation, state FROM users WHERE role='employee' AND id=$1",[userId])

        if(user.rows.length === 0){
            return res.status(404).json({message:"no such user found."})
        }

        const userData = user.rows[0]
        if(userData.state === "deactivated"){
            return res.status(401).json({message:"User is already deactivated."})
        }

        const deactivateEmployee = await pool.query("UPDATE users SET state = 'deactivated' WHERE id = $1 RETURNING name, email, role, department, designation, state",[userId]) 

        res.status(200).json({message:"Employee Deactivated Successfully" , user:deactivateEmployee.rows[0]})
        
    } catch (error) {
        res.status(500).json({error:error , message:"Server error"})
    }
}

export const reactivateEmployee = async (req,res) => {
    try {
        const userId = req.params.id

         if(isNaN(userId)){
            return res.status(400).json({message:"user ID should be integer."})
        }

         const user = await pool.query("SELECT name, email, role, department, designation, state FROM users WHERE role='employee' AND id=$1",[userId])

        if(user.rows.length === 0){
            return res.status(404).json({message:"no such user found."})
        }

        const userData = user.rows[0]
        if(userData.state === "active"){
            return res.status(401).json({message:"User is already active."})
        }

        const reactivateEmployee = await pool.query("UPDATE users SET state = 'active' WHERE id = $1 RETURNING name,email, role, department, designation, state",[userId])

        res.status(201).json({message:"Employee Reactivated Successfully" , user:reactivateEmployee.rows[0]})
        
    } catch (error) {
         res.status(500).json({error:error , message:"Server error"})
    }
}