const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const FriendshipMapper = require("../mappers/friendship.mapper");

class FriendshipService {
  constructor({ friendshipRepository, userRepository }) {
    this.friendshipRepository = friendshipRepository;
    this.userRepository = userRepository;
  }

  async sendRequest(requesterId, recipientId) { //İstek gönder
    if (requesterId.toString() === recipientId.toString()) {
      throw new BadRequestException("Kendinize arkadaşlık isteği gönderemezsiniz!");
    }

    const user = await this.userRepository.findById(recipientId);
    if (!user) {
      throw new BadRequestException("Kullanıcı bulunamadı!");
    }

    const existingRelation = await this.friendshipRepository.checkExistingRelation(
      requesterId,
      recipientId
    );
    if (existingRelation) {
      throw new UnauthorizedException("Zaten arkadaşsınız veya bekleyen bir istek var!");
    }

    const newRequest = await this.friendshipRepository.create({
      requester: requesterId,
      recipient: recipientId,
    });

    return FriendshipMapper.toResponse(newRequest);
  }
  async respondToRequest(requestId, recipientId, action) { //Gelen isteği yanıtla (Kabul et veya Reddet)
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
      throw new BadRequestException("Bu talep zaten işleme alındı!");
    }

    const updatedRequest = await this.friendshipRepository.update(requestId, {
      status: action,
    });

    return FriendshipMapper.toResponse(updatedRequest);
  }
  async getFriends(userId) { //Onaylanmış (Mevcut) arkadaşları listele
    const friendships = await this.friendshipRepository.findAcceptedFriends(userId);
    return friendships.map(friendship => FriendshipMapper.toResponse(friendship));
  }
  async findPendingRequests(userId){
    
  }

}

module.exports = FriendshipService;