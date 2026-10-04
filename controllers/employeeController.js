import bcrypt from 'bcryptjs'
import pool from '../config/db.js'

import { getServerError } from '../global.js'

export const getMyDetails = async (req,res) => {
    try {
        const userId = req.id

        const employeeDetails = await pool.query("SELECT name, email, role, department, designation, state FROM users WHERE id = $1",[userId])

        if(employeeDetails.rows.length === 0){
            return res.status(404).json({message:"No Employee Found." , employee:employeeDetails.rows})
        }

        res.status(200).json({message:"Employee fetched successfully" , employee:employeeDetails.rows[0]})

    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const updateMyDetails = async (req,res) => {
    try {
        const userId = req.id

        if(isNaN(userId)){
            return res.status(400).json({message:"User ID should be Integer."})
        }

        const data = req.body;
        const entries = Object.entries(data)

        const filterColumn = entries.filter(([key , _])=> key === 'name' || key ==='email' || key === 'password').map(([key  ,value])=> {
            if(key === 'password'){
                return ['password_hash' , value]
            }
            return [key , value]
        })

        if(filterColumn.length === 0){
            return res.status(400).json({message:"Invalid Credentials."})
        }

        for (const item of filterColumn) {
            if(item[0] === 'password_hash'){
                const saltRounds = await bcrypt.genSalt(10)
                item[1] = await bcrypt.hash(item[1] , saltRounds)
            }  
        }

        const column_name = filterColumn.filter(([key , _])=> key !== 'password_hash').map(([key , _])=> key).join(", ")
        const setClause = filterColumn.map(([key , _] , idx)=> {return `${key} = $${idx+1}`}).join(', ')
        const values = filterColumn.map(([_ , value])=>value)
        values.push(userId)
        
        const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING ${column_name}`       

        const updateDetails = await pool.query(query , values)

        if(updateDetails.rows.length === 0){
            return res.status(404).json({message:"No Employee Found." , updateDetails:updateDetails.rows})
        }
       
        res.status(200).json({message:"Task Updated Successfully" , updateDetails:updateDetails.rows[0]})
        
    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}