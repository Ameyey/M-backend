const asyncHandler=(requestHandles)=>{
  (req,res,next)=>{
    Promise.resolve(requestHandles(req,res,next)).catch((err)=>next(err))
  }
}

export {asyncHandler}

// const asyncHandler = (fn)=>async(req,res,next)=>{
//    try {
//     await fn(req,res,next)
//    } catch (error) {
//     res.status(error.code || 500).json({
//       suceess:false,
//       meassage:err.meassage
//     })
//    }
// }