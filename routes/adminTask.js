import express from 'express'

import {adminTasksEndPoints } from '../constant.js'
import { isAdmin } from '../middlewares/authMiddleware.js'
import { createTaskById, deleteTaskById, deleteTasksByEmployeeId, getAllTasks, getTaskById, getTasksByEmployeeId, updateTaskById } from '../controllers/adminTaskController.js'

const router  = express.Router()

router.get(adminTasksEndPoints.getAllTasks , isAdmin , getAllTasks)
router.get(adminTasksEndPoints.getTaskById , isAdmin , getTaskById)
router.put(adminTasksEndPoints.updateTaskById , isAdmin , updateTaskById)
router.post(adminTasksEndPoints.createTaskById , isAdmin , createTaskById)
router.delete(adminTasksEndPoints.deleteTaskById , isAdmin , deleteTaskById)
router.get(adminTasksEndPoints.getTasksByEmployeeId , isAdmin , getTasksByEmployeeId)
router.delete(adminTasksEndPoints.deleteTasksByEmployeeId , isAdmin , deleteTasksByEmployeeId)

export default router