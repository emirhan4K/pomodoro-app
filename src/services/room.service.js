const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const RoomMapper = require("../mappers/room.mapper");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

class RoomService {
  constructor({ roomRepository, userRepository,notificationService,profileRepository }) {
    this.roomRepository = roomRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
    this.profileRepository = profileRepository;
  }
  async createRoom(userId, roomData) {
    if (!roomData) roomData = {};

    roomData.owner = userId;
    roomData.members = [userId];

    if (roomData.roomName) {
      const baseSlug = slugify(roomData.roomName, { lower: true, strict: true });
      const randomNum = Math.floor(1000 + Math.random() * 9000); 
      roomData.slug = `${baseSlug}-${randomNum}`;
    }

    if (roomData.isPrivate === true || roomData.isPrivate === "true") {
      const hash = await hashPassword(roomData.roomPassword);
      roomData.roomPassword = hash;
    } else {
      delete roomData.roomPassword;
    }

    const newRoom = await this.roomRepository.create(roomData);
    return RoomMapper.toDTO(newRoom);
  }
  async getAllRooms() {
    const rooms = await this.roomRepository.model
      .find()
      .populate("owner", "username name")
      .populate("members", "username name")
      .sort({ createdAt: -1 });
    return RoomMapper.toDTOList(rooms);
  }
  async getRoomBySlug(slug) {
    const room = await this.roomRepository.findBySlug(slug);

    if (!room) {
      throw new BadRequestException("Böyle bir oda bulunamadı!");
    }
    return RoomMapper.toDTO(room);
  }
  async joinRoom(userId, roomId, password) {
    const room = await this.roomRepository.findByIdWithPassword(roomId);
    if (!room || room.isActive === false) {
      throw new BadRequestException("Oda bulunamadı!");
    }
    const isAlreadyMember = room.members.some(
      (memberId) => memberId.toString() === userId.toString(),
    );

    if (isAlreadyMember) {
      return { message: "Zaten bu odadasınız, yönlendiriliyorsunuz." };
    }
    if (room.members.length >= room.capacity) {
      throw new BadRequestException("Oda dolu!");
    }

    if (room.isPrivate === true) {
      if (!password)
        throw new BadRequestException(
          "Bu oda şifreli, lütfen şifreyi giriniz!",
        );

      const isMatch = await comparePassword(password, room.roomPassword);
      if (!isMatch) throw new BadRequestException("Oda şifresi yanlış!");
    }

    await this.roomRepository.addMember(roomId, userId);
    return { message: "Odaya başarıyla katıldınız." };
  }
  async leaveRoom(userId, roomId) {
    const room = await this.roomRepository.findById(roomId);

    if (!room) {
      throw new BadRequestException("Oda bulunamadı!");
    }
    await this.roomRepository.removeMember(roomId, userId);
    return { message: "Odadan başarıyla ayrıldınız." };
  }
  async updateAvatar(roomId, userId, fileUrl) {
    if (!fileUrl)
      throw new BadRequestException("Lütfen geçerli bir resim dosyası seçin!");

    const room = await this.roomRepository.model.findOne({
      _id: roomId,
      owner: userId,
    });
    
    if (!room)
      throw new BadRequestException(
        "Oda bulunamadı veya bu işlemi yapmaya yetkiniz yok!",
      );
    room.roomAvatar = fileUrl;
    
    await room.save();

    return RoomMapper.toDTO(room);
  }
  async updateBanner(roomId, userId, fileUrl) {
    if (!fileUrl)
      throw new BadRequestException(
        "Lütfen geçerli bir arka plan dosyası seçin!",
      );

    const room = await this.roomRepository.model.findOne({
      _id: roomId,
      owner: userId,
    });
    
    if (!room)
      throw new BadRequestException(
        "Oda bulunamadı veya bu işlemi yapmaya yetkiniz yok!",
      );
    room.roomBanner = fileUrl;
    await room.save();

    return RoomMapper.toDTO(room);
  }
  async deleteRoom(roomId, userId) {
    const room = await this.roomRepository.model.findById(roomId);
    if (!room) throw new BadRequestException("Oda bulunamadı!");

    if (room.owner.toString() !== userId) {
      throw new BadRequestException("Bu odayı silme yetkiniz yok!");
    }    
    await this.roomRepository.deleteRoomById(roomId);
    
    return { success: true, message: "Oda başarıyla silindi." };
  }
  async inviteUserToRoom(currentUserId, targetUserId, roomId){
    const room = await this.roomRepository.findById(roomId);
    if(!room){
      throw new BadRequestException("Oda bulunamadı!")
    }
    const currentUser = await this.profileRepository.findByUserId(currentUserId);
    const inviterName = currentUser?.user?.username || currentUser?.username || "Bir arkadaşın";
    const inviterAvatar = currentUser?.avatar || "default-avatar.png";
    await this.notificationService.createNotification({
      recipient: targetUserId,
      sender: currentUserId,
      type: "ROOM_INVITE",
      content: `@${inviterName} seni '${room.roomName || "Odaklan"}' odasına davet ediyor!`,
      avatar: inviterAvatar,
      roomId: roomId,
      roomSlug: room.slug
    });
    return { success: true, message: "Davet başarıyla gönderildi!" };
  }
}

module.exports = RoomService;
