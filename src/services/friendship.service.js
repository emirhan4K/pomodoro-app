const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");

class FriendshipService {
  constructor({ friendshipRepository, userRepository }) {
    this.friendshipRepository = friendshipRepository;
    this.userRepository = userRepository;
  }
  async sendRequest(requesterId, recipientId) {
    if (requesterId === recipientId) {
      throw new BadRequestException(
        "Kendinize arkadaşlık isteği gönderemezsiniz!",
      );
    }
    const user = await this.userRepository.findById(recipientId);
    if (!user) {
      throw new BadRequestException("Kullanıcı bulunamadı!");
    }
    const existingRelation = await this.friendshipRepository.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
      status: { $in: ["pending", "accepted"] },
    });
    if (existingRelation) {
      throw new UnauthorizedException(
        "Zaten arkadaşsınız veya bekleyen bir istek var!",
      );
    }
    const newRequest = await this.friendshipRepository.create({
      requester: requesterId,
      recipient: recipientId,
    });
    return newRequest;
  }
  async respondToRequest(requestId, recipientId, action) {
    const allowedActions = ["accepted", "rejected"];
    if (!allowedActions.includes(action)) {
      throw new BadRequestException("Geçersiz işlem!");
    }
    const request = await this.friendshipRepository.findById(requestId);
    if (!request) {
      throw new BadRequestException("Arkadaşlık isteği bulunamadı!");
    }
    if (request.recipient.toString() !== recipientId.toString()) {
      throw new UnauthorizedException("Bu isteğe yanıt veremezsiniz!");
    }
    if (request.status !== "pending") {
      throw new Error("Bu talep zaten işleme alındı!");
    }
    const updatedRequest = await this.friendshipRepository.update(requestId, {
      status: action,
    });
    return updatedRequest;
  }
}

module.exports = FriendshipService;
