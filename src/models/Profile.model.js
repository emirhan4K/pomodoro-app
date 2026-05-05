const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    roomName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    roomAvatar: {
        type: String,
        default: "default-room.png"
    },
    roomBanner: {
        type: String,
        default: "default-room-banner.png"
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    roomPassword: { 
        type: String,
        select: false 
    },
    capacity: {
        type: Number,
        default: 10
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isActive: { 
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);