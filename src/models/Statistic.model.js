const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema({
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
  }
}, { timestamps: true });

module.exports = mongoose.model("Statistic", statisticSchema);