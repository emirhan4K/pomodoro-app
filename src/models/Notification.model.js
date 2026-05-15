const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
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
      enum: ["FRIEND_REQUEST", "SYSTEM", "LEVEL_UP","ROOM_INVITE"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    roomId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room"
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
