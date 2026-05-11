const BaseRepository = require("../repositories/base.repository");
const Message = require("../models/Message.model");
const Profile = require("../models/Profile.model");

class MessageRepository extends BaseRepository {
  constructor() {
    super(Message);
  }

  async findByRoomId(roomId, limit = 50) {
    // 1. Mesajları ve Kullanıcı İsimlerini Çek (lean() ile objeye çeviriyoruz ki müdahale edebilelim)
    const messages = await Message.find({ room: roomId })
      .populate("user", "username")
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    // 2. Mesaj atanların ID'lerini topla
    const userIds = messages.map(msg => msg.user._id);

    // 3. Bu ID'lere ait Profilleri bul (Sadece avatarı çekiyoruz)
    const profiles = await Profile.find({ user: { $in: userIds } }).select("user avatar lean()");

    // 4. Hızlı eşleştirme için bir "Avatar Sözlüğü" oluştur
    const avatarMap = {};
    profiles.forEach(p => {
      avatarMap[p.user.toString()] = p.avatar;
    });

    // 5. Mesajlara avatarları yapıştırıp frontend'e gönder
    return messages.map(msg => ({
      ...msg,
      user: {
        ...msg.user,
        avatar: avatarMap[msg.user._id.toString()] || "default-avatar.png"
      }
    }));
  }

  async addSeenUser(messageId, userId) {
    return await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenBy: userId } }, // $addToSet aynı kişiyi iki kez eklemez
      { new: true },
    );
  }
}

module.exports = MessageRepository;
