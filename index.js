import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import employeeRoutes from './routes/employee.js'
import adminTaskRoutes from './routes/adminTask.js'
import employeeTaskRoutes from './routes/employeeTask.js'

dotenv.config()

// port
const app = express()
const port = process.env.PORT || 3000

// middlewares
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

// routes
app.use("/auth" , authRoutes)
app.use("/admin",adminRoutes)
app.use("/employee",employeeRoutes)
app.use("/adminTask",adminTaskRoutes)
app.use("/employeeTask",employeeTaskRoutes)

app.listen(port , ()=>{
    console.log(`Server is listening on port ${port}`)
})