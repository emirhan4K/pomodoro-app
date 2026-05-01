const mongoose = require("mongoose");

const pomodoroSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    duration:{
        type:Number,
        default:25,
    },
    category:{
        type:String,
        default:"Genel"
    },
    status:{
        type:String,
        enum:["completed","interrupted"]
    }
},{timestamps: true})

module.exports = mongoose.model("Pomodoro",pomodoroSchema);