class AplError extends Error{
  constructor(
    statusCode,
    meassage = "Someting went wrong",
    errors=[],
    stack = ""
  ){
    super(meassage)
    this.statusCode = statusCode
    this.data = null 
    this.message = meassage
    this.success = false ;
    this.errors= errors

    if(stack){
      this.stack= stack
    }
    else{
      Error.captureStackTrace(this,this.constructor)
    }
  }
}


export {AplError}