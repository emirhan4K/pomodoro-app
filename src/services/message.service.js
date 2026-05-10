class MessageService {
  constructor({ messageRepository }) {
    this.messageRepository = messageRepository;
  }

  async saveMessage(roomId, user, text) {
    return await this.messageRepository.create({
      room: roomId,
      user: user.id || user._id,
      username: user.username,
      text: text,
      seenBy: [user.id || user._id] // Mesajı atan kişi otomatik görmüş sayılır
    });
  }

  async markAsSeen(messageId, userId) {
    return await this.messageRepository.addSeenUser(messageId, userId);
  }
}

module.exports = MessageService;