const BaseRepository = require("./base.repository");
const Friendship = require("../models/friendship.model");

class FriendshipRepository extends BaseRepository {
  constructor() {
    super(Friendship);
  }

  //İki kişi arasında daha önce atılmış bir istek var mı ?
  async checkExistingRelation(userId1, userId2) {
    return await this.model.findOne({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 },
      ],
      status: { $in: ["pending", "accepted"] },
    });
  }

  // Onaylanmış (accepted) arkadaşları ve isimlerini getir
  async findAcceptedFriends(userId) {
    return await this.model.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    })
    .populate("requester", "username email")
    .populate("recipient", "username email");
  }

  //Bekleyen istekleri getir
  async findPendingRequests(userId){
    return await this.model.find({
        recipient: userId,
        status:"pending"
    }).populate("requester","username email")
  }
}

module.exports = FriendshipRepository;