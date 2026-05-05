const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");

class RoomService{
    constructor({roomRepository,userRepository}){
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }
    async createRoom(userId){
        const user = await this.userRepository.findById(userId);
        if(!user) throw new BadRequestException("Hesap oluşturunuz")
        
        if(user.isPrivate === true)
    }
}