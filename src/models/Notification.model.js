const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["FRIEND_REQUEST", "SYSTEM", "LEVEL_UP"], //Arkadaşlık isteği, Sistem mesajı, Seviye atlama
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
      type: Boolean,
      default: false,
    },
},{timestamps:true});

module.exports = mongoose.model("Notification", notificationSchema);
