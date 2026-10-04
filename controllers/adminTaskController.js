import pool from '../config/db.js'

import { getServerError } from '../global.js';

export const createTaskById = async (req,res) => {
    try {
        const userId = req.params.id;

         if(isNaN(userId)){
            return res.status(400).json({message:"user ID should be integer."})
        }

        const isUserExist = await pool.query("SELECT name FROM users WHERE state='active' AND role='employee' AND id = $1",[userId])

        if(isUserExist.rows.length === 0){
         return res.status(404).json({message:"employee not found"})
        }

        const {title , description} = req.body;

        if(!title){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        const vTitle = String(title).toLowerCase().trim()
        const tasks = await pool.query("SELECT task_title FROM user_tasks WHERE employee_id = $1",[userId])
        const isSameTask = tasks.rows.filter((f)=>String(f.task_title).toLowerCase().trim() === vTitle)

        if(isSameTask.length > 0){
            return res.status(400).json({message:"Task Already Exist."})
        }
        
        const newTask = await pool.query("INSERT into user_tasks(employee_id , task_title , task_description) VALUES($1 , $2 , $3) RETURNING task_title, task_description, task_state",[userId , title , description])

        const task = newTask.rows[0]

        res.status(201).json({message:"Task Created Successfully" , task  , employee:{employeeId:userId , employeeName:isUserExist.rows[0].name}})

    } catch (error) {        
        getServerError(error)
        return res.status(500).json({message:"Server error"})
    }
}


export const getAllTasks = async(req,res)=>{
    try{
        const tasks = await pool.query("SELECT user_tasks.id, user_tasks.employee_id, user_tasks.task_title, user_tasks.task_description, user_tasks.task_state, user_tasks.state_reason, user_tasks.created_at, users.name, users.department, users.designation FROM user_tasks INNER JOIN users ON user_tasks.employee_id = users.id WHERE users.state='active'")

       if(tasks.rows.length === 0){
        return res.status(404).json({message:"No Tasks Found" , tasks:tasks.rows})
       }
    
       res.status(200).json({message:"All Tasks Fetched Successfully" , tasks:tasks.rows})   
    }
    catch(error){
        getServerError(error)
        return res.status(500).json({message:"Server error"});
    }
}

export const getTaskById = async (req,res) => {
    try {
        const id = req.params.id;

        if(isNaN(id)){
            return res.status(400).json({message:"task ID should be integer."})
        }

        const task = await pool.query("SELECT user_tasks.id, user_tasks.employee_id, user_tasks.task_title, user_tasks.task_description, user_tasks.task_state, user_tasks.state_reason, users.name, users.email, users.role, users.department, users.designation FROM user_tasks INNER JOIN users ON user_tasks.employee_id = users.id WHERE user_tasks.id = $1",[id])

        if(task.rows.length === 0){
            return res.status(404).json({message:"No task found." , task:task.rows})
        }

        res.status(200).json({message:"Employee task fetched successfully" , task:task.rows[0]})
    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"});
    }
}
export const getTasksByEmployeeId = async (req,res) => {
    try {
        const userId = req.params.id;

        if(isNaN(userId)){
            return res.status(400).json({message:"task ID should be integer."})
        }

        const tasks = await pool.query("SELECT user_tasks.id, user_tasks.employee_id, user_tasks.task_title, user_tasks.task_description, user_tasks.task_state, user_tasks.state_reason, users.name, users.email, users.role, users.department, users.designation FROM user_tasks INNER JOIN users ON user_tasks.employee_id = users.id WHERE user_tasks.employee_id = $1",[userId])

        if(tasks.rows.length === 0){
            return res.status(404).json({message:"No task found." , task:tasks.rows})
        }

        res.status(200).json({message:"Employee task on this id fetched successfully" , task:tasks.rows})

    } catch (error) {
        getServerError(error)
        return res.status(500).json({message:"Server error"});
    }
}

export const updateTaskById = async (req,res) => {
    try {
        const id = req.params.id;

        if(isNaN(id)){
            return res.status(400).json({message:"task ID should be integer."})
        }

        const {task_title , task_description} = req.body;

        if(!task_title){
            return res.status(400).json({message:"Invalid Credentials."})
        }

        const updateTask = await pool.query("UPDATE user_tasks SET task_title = $1, task_description = $2 WHERE id = $3 RETURNING task_title, task_description" , [task_title , task_description , id])

        if(updateTask.rows.length === 0){
            return res.status(404).json({message:"No task found" , task:updateTask.rows})
        }

        res.status(200).json({message:"Task Updated Successfully" , updatedTaskById:updateTask.rows[0]})

    } catch (error) {
       getServerError(error)
        return res.status(500).json({message:"Server error"}); 
    }
}

export const deleteTaskById = async (req,res) => {
    try {
        const id = req.params.id

         if(isNaN(id)){
            return res.status(400).json({message:"task ID should be integer."})
        }

        const deleteTask = await pool.query("DELETE FROM user_tasks WHERE id = $1 RETURNING id, employee_id, task_title, task_description, task_state, state_reason",[id])

        if(deleteTask.rows.length === 0){
            return res.status(404).json({message:"No task found." , task:deleteTask.rows})
        }

        res.status(200).json({message:"task deleted successfully" , task:deleteTask.rows[0]})
    } catch (error) {
        console.log(error);
        
        getServerError(error)
        return res.status(500).json({message:"Server error"}); 
    }
}
export const deleteTasksByEmployeeId = async (req,res) => {
    try {
        const userId = req.params.id

         if(isNaN(userId)){
            return res.status(400).json({message:"task ID should be integer."})
        }

        const deleteEmployeeTasks = await pool.query("DELETE FROM user_tasks WHERE employee_id = $1 RETURNING id, employee_id, task_title, task_description, task_state, state_reason",[userId])

        if(deleteEmployeeTasks.rows.length === 0){
            return res.status(404).json({message:"No tasks found on this employee id." , task:deleteEmployeeTasks.rows})
        }

        res.status(200).json({message:"Tasks on this Employee deleted successfully" , task:deleteEmployeeTasks.rows})

    } catch (error) {
        console.log(error);
        
        getServerError(error)
        return res.status(500).json({message:"Server error"}); 
    }
}