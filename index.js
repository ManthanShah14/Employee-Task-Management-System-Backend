import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'

dotenv.config()

// port
const app = express()
const port = process.env.PORT || 3000

// middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

// routes
app.use("/auth" , authRoutes)

app.listen(port , ()=>{
    console.log(`Server is listening on port ${port}`)
})