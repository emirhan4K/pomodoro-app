const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // Her kullanıcının sadece 1 profili olabilir!
  },
  title: {
    type: String,
    default: "",
    trim: true
  },
  avatar: {
    type: String,
    default: "default-avatar.png"
  },
  banner: {
    type: String,
    default: "default-banner.png"
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  totalPomodoros: {
    type: Number,
    default: 0
  },
  totalWorkTime: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  lastSessionDate: {
    type: Date,
    default: null
  },
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  settings: {
    focusTime: { type: Number, default: 25 },
    shortBreak: { type: Number, default: 5 },
    longBreak: { type: Number, default: 15 },
    soundEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    tickSoundEnabled: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);