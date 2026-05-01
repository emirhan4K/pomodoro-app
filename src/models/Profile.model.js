const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  totalPomodoros: {
    type: Number,
    default: 0
  },
  totalWorkTime: {
    type: Number,
    default: 0 
  },
  bio: {
    type: String,
    default: "Odaklanmaya hazır!"
  },
  avatar: {
    type: String,
    default: "default-avatar.png"
  }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);