import express from 'express'

import { authEndpoints } from '../constant.js'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import {  login , logout , changePassword } from '../controllers/authController.js'

const router  = express.Router()

router.post(authEndpoints.login, login)
router.post(authEndpoints.logout , logout)
router.put(authEndpoints.changePassword , isAuthenticated ,  changePassword)

export default router