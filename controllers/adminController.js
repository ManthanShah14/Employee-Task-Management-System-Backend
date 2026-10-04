import bcrypt from 'bcryptjs';
import pool from '../config/db.js'

import { getServerError } from '../global.js';

export const createEmployee = async(req,res)=>{
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
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const getAllEmployees = async (req,res) => {
    try {
        const employees = await pool.query("SELECT id, name, email, role, department, designation FROM users WHER role = 'employee' AND state = 'active'")

        if(employees.rows.length === 0){
            return res.status(404).json({message:"No Employees Found." , employees:employees.rows})
        }
        
         res.status(200).json({message:"Employess Fetched Successfully" , employees:employees.rows})
        
    } catch (error) {
       getServerError(error)
        return res.status(500).json({message:"Server error"})
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
        getServerError(error)
        return res.status(500).json({message:"Server error"})
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
            return res.status(404).json({message:"no such user found on this given id."})
        }
        
        res.status(200).json({message:"Employee Updated Successfully" , user:update.rows[0]})
        
    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"})
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
            return res.status(409).json({message:"User is already deactivated."})
        }

        const deactivated = await pool.query("UPDATE users SET state = 'deactivated' WHERE id = $1 RETURNING name, email, role, department, designation, state",[userId]) 

        res.status(200).json({message:"Employee Deactivated Successfully" , user:deactivated.rows[0]})
        
    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"})
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
            return res.status(409).json({message:"User is already active."})
        }

        const reactivate = await pool.query("UPDATE users SET state = 'active' WHERE id = $1 RETURNING name,email, role, department, designation, state",[userId])

        res.status(200).json({message:"Employee Reactivated Successfully" , user:reactivate.rows[0]})
        
    } catch (error) {
         getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const deleteEmployee = async (req,res) => {
    try {
        const userId = req.params.id

        if(isNaN(userId)){
            return res.status(400).json({message:"User ID should be Integer."})
        }

        const taskExists = await pool.query("SELECT id, employee_id, task_title FROM user_tasks WHERE employee_id = $1",[userId])

        if(taskExists.rows.length > 0){
            return res.status(409).json({message:"Please Delete Tasks First on this id." , task:taskExists.rows})
        }

        const deleteEmployee = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, department, designation" , [userId])

        if(deleteEmployee.rows.length === 0){
            return res.status(404).json({message:"No Employee Found." , employee:deleteEmployee.rows})
        }

        res.status(200).json({message:"Employee deleted Successfully." , employee:deleteEmployee.rows[0]})

    } catch (error) {
         getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}