import dotenv from 'dotenv';

import connectDB from "./Db/DB_Conction.js";
import express from "express";

const app= express()



connectDB()
.then(()=>{
  app.listen(process.env.PORT||8000,()=>{
    console.log(` Server Runing at PORT : ${process.env.PORT}`)
  })
  app.on("err",(err)=>{
     console.log("Error",err);
     throw err
  })
})
.catch((err)=>{
  console.log("MoNGO db connection failes !!!",err);
})







console.log("5:49:58")




// import express from 'express'
// const app = express()

// ( async()=>{ 
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${BD_name}`)
//     app.on("error",(error)=>{
//       console.log("ERROR",error)
//       throw error
//     })

//     app.listen(process.env.PORT,()=>{
//       console.log(`App is listen on Post ${process.env.PORT}`)
//     })    

//   } catch (error) {
//     console.error("Error:",error)
//     throw error
//   }
// })()



