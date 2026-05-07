const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const RoomMapper = require("../mappers/room.mapper");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

class RoomService {
  constructor({ roomRepository, userRepository }) {
    this.roomRepository = roomRepository;
    this.userRepository = userRepository;
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
  async updateAvatar(roomId, userId, avatarFilename) {
    if (!avatarFilename)
      throw new BadRequestException("Lütfen geçerli bir resim dosyası seçin!");

    const room = await this.roomRepository.model.findOne({
      _id: roomId,
      owner: userId,
    });
    if (!room)
      throw new BadRequestException(
        "Oda bulunamadı veya bu işlemi yapmaya yetkiniz yok!",
      );
    if (room.roomAvatar && room.roomAvatar !== "default-room.png") {
      const oldImagePath = path.join(
        __dirname,
        "../public/uploads/avatars",
        room.roomAvatar.replace("/uploads/avatars/", ""),
      );
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    room.roomAvatar = `/uploads/avatars/${avatarFilename}`;
    await room.save();

    return RoomMapper.toDTO(room);
  }
  async updateBanner(roomId, userId, bannerFilename) {
    if (!bannerFilename)
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

    if (room.roomBanner && room.roomBanner !== "default-room-banner.png") {
      const oldImagePath = path.join(
        __dirname,
        "../public/uploads/banners",
        room.roomBanner.replace("/uploads/banners/", ""),
      );
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    room.roomBanner = `/uploads/banners/${bannerFilename}`;
    await room.save();

    return RoomMapper.toDTO(room);
  }
  async deleteRoom(roomId, userId) {
    const room = await this.roomRepository.model.findById(roomId);
    if (!room) throw new BadRequestException("Oda bulunamadı!");

    if (room.owner.toString() !== userId) {
      throw new BadRequestException("Bu odayı silme yetkiniz yok!");
    }
    if (room.roomAvatar && !room.roomAvatar.includes('default-')) {
      const avatarPath = path.join(__dirname, '../public', room.roomAvatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }
    if (room.roomBanner && !room.roomBanner.includes('default-')) {
      const bannerPath = path.join(__dirname, '../public', room.roomBanner);
      if (fs.existsSync(bannerPath)) fs.unlinkSync(bannerPath);
    }
    await this.roomRepository.deleteRoomById(roomId);
    
    return { success: true, message: "Oda ve bağlı resimler tamamen silindi." };
  }
}

module.exports = RoomService;
