const BaseRepository = require("./base.repository");
const Rooms = require("../models/Room.model");

class RoomRepository extends BaseRepository{
    constructor(){
        super(Rooms)
    }
    async findActiveRooms(roomId){
        return await this.model.findAll(roomId).select('-password')
    }
    async findByIdWithPassword(roomId){
        return await this.model.findById(roomId).select('+password')
    }
    async addMember(roomId,userId){
        return await this.model.findOneAndUpdate(
            {$push: userId },
        {new:true})
    }
    
}

module.exports = RoomRepository;