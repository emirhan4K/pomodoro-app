const BaseRepository = require("./base.repository");
const Rooms = require("../models/Room.model");

class RoomRepository extends BaseRepository{
    constructor(){
        super(Rooms)
    }
    async findAll(query = {}) {
  return await this.model.find(query).populate('owner', 'username avatar');
}
    async findActiveRooms(){
        return await this.model.find({ isActive: true }).populate("owner", "username avatar").populate("members", "username avatar");
    }
    async findByIdWithPassword(roomId){
        return await this.model.findById(roomId).select("+roomPassword")
    }
    async addMember(roomId,userId){
        return await this.model.findOneAndUpdate({ _id: roomId },
            {$push : { members: userId }},
            {new:true}
        )
    }
    async removeMember(roomId,userId){
        return await this.model.findOneAndUpdate({ _id: roomId },
            {$pull : { members: userId }},
            {new:true}
        )
    }
    async deleteRoomById(roomId) {
        return await this.model.findByIdAndDelete(roomId);
    }
}

module.exports = RoomRepository;
