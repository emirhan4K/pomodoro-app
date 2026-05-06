const BaseRepository = require("./base.repository");
const Rooms = require("../models/Room.model");

class RoomRepository extends BaseRepository {
  constructor() {
    super(Rooms);
  }
  async findActiveRooms() {
    return await this.model.find(isActive === true).populate({
      path: 'owner',
      select: 'username avatar' 
    }).populate({
      path: 'members',
      select: 'username avatar'
    })
  }
  async findByIdWithPassword(roomId) {
    return await this.model.findById(roomId).select("+password");
  }
  async addMember(roomId, userId) {
    return await this.model.findOneAndUpdate({ $push: userId }, { new: true });
  }
  async removeMember(roomId, userId) {
    return await this.model.findOneAndUpdate({ $pull: userId }, { new: true });
  }
}

module.exports = RoomRepository;
