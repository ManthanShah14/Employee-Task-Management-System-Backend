import express from 'express'

import { isAdmin } from '../middlewares/authMiddleware.js'
import { createEmoloyee, deactivateEmployee, getAllEmployees, getEmployeeById, login, reactivateEmployee, updateEmployee } from '../controllers/authController.js'


const router  = express.Router()

router.post("/login" , login)
router.post("/createEmployee" , isAdmin , createEmoloyee)
router.get("/getAllEmployees" , isAdmin , getAllEmployees)
router.put("/updateEmployee/:id" , isAdmin , updateEmployee)
router.get("/getEmployeeById/:id" , isAdmin , getEmployeeById)
router.put("/reactivateEmployee/:id" , isAdmin , reactivateEmployee)
router.put("/deactivateEmployee/:id" , isAdmin , deactivateEmployee)

export default router