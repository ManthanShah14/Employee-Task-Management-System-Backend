import express from 'express'

import { authEndpoints } from '../constant.js'
import {  login } from '../controllers/authController.js'

const router  = express.Router()

router.post( authEndpoints.login, login)

export default router