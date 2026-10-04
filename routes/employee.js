import express from 'express'

import { employeeEndpoints } from '../constant.js'
import { isEmployee } from '../middlewares/authMiddleware.js'
import { getMyDetails, updateMyDetails } from '../controllers/employeeController.js'


const router  = express.Router()

router.get(employeeEndpoints.getMyDetails , isEmployee , getMyDetails)
router.put(employeeEndpoints.updateMyDetails , isEmployee , updateMyDetails)

export default router