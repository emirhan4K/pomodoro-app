const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: "Yeni Odaklayıcı", 
  },
  settings: {
    focusTime: { type: Number, default: 25 }, //Pomodoro çalışma süresi
    shortBreak: { type: Number, default: 5 }, //Kısa mola süresi
    longBreak: { type: Number, default: 15 }, //Uzun mola süresi
    soundEnabled: { type: Boolean, default: true }, //Alarm sesi açık/kapalı durumu
    notificationsEnabled: { type: Boolean, default: true }, //Tarayıcı bildirim durumu.
    tickSoundEnabled: { type: Boolean, default: false }, //Tık-tık saat sesi durumu
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
  },
  xp:{
    type:Number,
    default:0,
  },
  level:{
    type:Number,
    default:1
  },
  currentStreak:{ //mevcut streak
    type:Number,
    default:0
  },
  bestStreak:{ //en iyi streak
    type:Number,
    default:0
  },
  lastSessionDate:{ //sonOturumTarihi
    type:Date,
    default:null
  }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);