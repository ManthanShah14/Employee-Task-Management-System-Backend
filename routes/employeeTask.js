import express from 'express'

import { employeeTaskEndPoints } from '../constant.js'
import { isEmployee } from '../middlewares/authMiddleware.js'
import { getMyTask, updateMyTask} from '../controllers/employeeTaskController.js'

const router  = express.Router()

router.get(employeeTaskEndPoints.getMyTask , isEmployee , getMyTask)
router.put(employeeTaskEndPoints.updateMyTask , isEmployee , updateMyTask)

export default router