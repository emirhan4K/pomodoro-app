const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    owner:{ //Odayı açan
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    roomName:{
        type:String,
        required:true,
        trim:true,
        minlength: [3, "Oda adı en az 3 karakter olmalıdır"],
        maxlength: [30, "Oda adı en fazla 30 karakter olabilir"]
    },
    description:{
        type:String,
        required:true,
        trim:true,
        maxlength: [200, "Açıklama çok uzun"]
    },
    roomAvatar:{
        type:String,
        default:"default-avatar.png"
    },
    roomBanner:{
        type:String,
        default:"default-banner.png"
    },
    isPrivate:{
        type:Boolean,
        default:false
    },
    roomPassword: { // Eğer isPrivate true ise burası dolacak
        type: String,
        select: false 
    },
    capacity: {
        type: Number,
        default: 10, 
        max: [50, "Oda en fazla 50 kişilik olabilir"]
    },
    members: [{ //Odadaki üyeler
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isActive: { // Oda o an açık mı?
        type: Boolean,
        default: true
    },
},{timestamps:true});

module.exports = mongoose.model("Room",roomSchema);