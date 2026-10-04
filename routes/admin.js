import express from 'express'

import { adminEndpoints } from '../constant.js'
import { isAdmin } from '../middlewares/authMiddleware.js'
import {createEmployee, deactivateEmployee, deleteEmployee, getAllEmployees, getEmployeeById,reactivateEmployee, updateEmployee} from '../controllers/adminController.js'

const router  = express.Router()

router.put( adminEndpoints.updateEmployee, isAdmin , updateEmployee)
router.post( adminEndpoints.createEmployee, isAdmin , createEmployee)
router.get( adminEndpoints.getAllEmployees, isAdmin , getAllEmployees)
router.get( adminEndpoints.getEmployeeById, isAdmin , getEmployeeById)
router.delete( adminEndpoints.deleteEmployee, isAdmin , deleteEmployee)
router.put( adminEndpoints.deactivateEmployee, isAdmin , deactivateEmployee)
router.put( adminEndpoints.reactivateEmployee, isAdmin , reactivateEmployee)

export default router