const BaseRepository = require("../repositories/base.repository");
const Message = require("../models/Message.model");

class MessageRepository extends BaseRepository {
  constructor() { super(Message); }

  async findByRoomId(roomId, limit = 50) {
    return await Message.find({ room: roomId }).sort({ createdAt: 1 }).limit(limit);
  }

  async addSeenUser(messageId, userId) {
    return await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenBy: userId } }, // $addToSet aynı kişiyi iki kez eklemez
      { new: true }
    );
  }
}

module.exports = MessageRepository;