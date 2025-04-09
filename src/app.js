import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
  origin:process.env.CORS_ORIGING,
  credentials:true
}))

//  console.log("8:33:35")

app.use(express.json({
  limit:"16kb"
}))
app.use(express.urlencoded({
  extended:true,
  limit:"16kb"
}))
app.use(express.static("public"))

app.use(cookieParser())

// routers

import userRouter from './routes/user.routes.js'

// router declaration

app.use("/api/v1/users",userRouter)


// http://localhost:8000/api/v1/users/register






export { app }