import mongoose , {Schema} from "mongoose";

const subscription = new Schema({
  subscribar:{
    type:Schema.Types.ObjectId,  // one who is Subscribing 
    ref:"User"
  },
  channel:{
    type:Schema.Types.ObjectId, // one who to subscribar is subscribing
    ref:"User"
  }
} , {timestamps:true}
)


export const Subscription  = mongoose.model("Subscription",subscription)