class AplError extends Error{
  constructor(
    statusCode,
    meassage = "Someting went wrong",
    errors=[],
    statck = ""
  ){
    super(meassage)
    this.statusCode = statusCode
    this.data = null 
    this.message = meassage
    this.success = false ;
    this.errors= errors

    if(statck){
      this.statck= statck
    }
    else{
      Error.captureStackTrace(this,this.constructor)
    }
  }
}


export {AplError}