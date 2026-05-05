const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const { hashPassword} = require("../utils/hash.utils");
const RoomMapper = require("../mappers/room.mapper");

class RoomService{
    constructor({roomRepository,userRepository}){
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }
    async createRoom(userId,roomData){
        roomData.owner = userId;
        roomData.members = [userId];

        if(roomData.isPrivate === true){
            const hash = await hashPassword(roomData.roomPassword)
            roomData.roomPassword = hash;
        }else{
            delete roomData.roomPassword;
        }
       const newRoom = await this.roomRepository.create(roomData);
        return RoomMapper.toDTO(newRoom);
    }

    async getRoomById(roomId) {
        const room = await this.roomRepository.findById(roomId).populate("members"); 
        
        if (!room) {
            throw new BadRequestException("Böyle bir oda bulunamadı!");
        }
        return RoomMapper.toDTO(room);
    }
}

module.exports = RoomService;