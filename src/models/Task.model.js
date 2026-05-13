const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    missionType: {
      type: String,
      enum: ["POMODORO", "FOCUS_TIME", "ROOM_JOIN"], 
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    target: {
      type: Number,
      required: true,
    },
    // Kullanıcının şu anki durumu (Örn: 1 Pomodoro yaptı)
    progress: {
      type: Number,
      default: 0,
    },
    // Görev bittiğinde kullanıcı XP ödülünü aldı mı?
    isClaimed: {
      type: Boolean,
      default: false,
    },
    pomodoroCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
