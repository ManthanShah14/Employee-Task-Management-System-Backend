import pool from '../config/db.js'

import { getServerError } from '../global.js';

export const getMyTask = async (req,res) => {
    try {
        const userId = req.id;
        
        const task = await pool.query("SELECT id, task_title, task_description, task_state, state_reason FROM user_tasks WHERE employee_id = $1",[userId]);

        if(task.rows.length === 0){
            return res.status(200).json({message:"No Task assigned." , task:task.rows})
        }
        
        res.status(200).json({message:"My task fetched successfully" , tasks:task.rows})

    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"});
    }
}

export const updateMyTask = async (req,res) => {
    try{
        const userId = req.id

         if(isNaN(userId)){
            return res.status(400).json({message:"Employee ID should be integer."})
        }

        const {id , task_state , state_reason} = req.body;

        if(!id || !task_state){
            return res.status(400).json({message:"Invalid Credentials."})
        }

        if(isNaN(id)){
            return res.status(400).json({message:"task ID should be integer."})
        }
        
        if(task_state === 'not_completed' && (!state_reason || state_reason.trim() === '')){
            return res.status(400).json({message:"If task is not completed, Please write valid reason."})
        }
        
        const updateTask = await pool.query("UPDATE user_tasks SET task_state = $1, state_reason = $2 WHERE id = $3 AND employee_id = $4 RETURNING id, employee_id, task_title, task_description, task_state, state_reason",[task_state , state_reason , id , userId])

        if(updateTask.rows.length === 0){
            return res.status(404).json({message:"My Task not found."})
        }

        res.status(200).json({message:"My Task Updated Successfully" , updatedMyTask:updateTask.rows[0]})
        
    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"});
    }
}