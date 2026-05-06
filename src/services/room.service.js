const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const RoomMapper = require("../mappers/room.mapper");

class RoomService {
  constructor({ roomRepository, userRepository }) {
    this.roomRepository = roomRepository;
    this.userRepository = userRepository;
  }
  async createRoom(userId, roomData) {
    roomData.owner = userId;
    roomData.members = [userId];

    if (roomData.isPrivate === true) {
      const hash = await hashPassword(roomData.roomPassword);
      roomData.roomPassword = hash;
    } else {
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
  async joinRoom(userId, roomId, password) {
    const room = await this.roomRepository.findByWithPassword(roomId);
    if (!room || room.isActive === false) {
      throw new BadRequestException("Oda bulunamadı!");
    }
    const isAlreadyMember = room.members.some(
      (memberId) => memberId.toString() === userId.toString(),
    );
    if (room.members.includes(userId)) {
      throw new UnauthorizedException("Zaten bu odadasınız!");
    }
    if (room.members.length >= room.capacity) {
      throw new UnauthorizedException("Oda dolu!");
    }
    if (room.isPrivate === true) {
      if (!password)
        throw new BadRequestException(
          "Bu oda şifreli, lütfen şifreyi giriniz!",
        );
      const isMatch = await comparePassword(password, room.roomPassword);
      if (!isMatch) throw new UnauthorizedException("Oda şifresi yanlış!");
    }
    await this.roomRepository.addMember(roomId, userId);
    return { message: "Odaya başarıyla katıldınız." };
  }
  async leaveRoom(userId, roomId) {
    const room = await this.roomRepository.findById(roomId);

    if (!room) {
      throw new BadRequestException("Oda bulunamadı!");
    }
    //şifreyi bilen veya açık odaya gelen herkes girebilir
    await this.roomRepository.removeMember(roomId, userId);
    return { message: "Odadan başarıyla ayrıldınız." };
  }
}

module.exports = RoomService;
