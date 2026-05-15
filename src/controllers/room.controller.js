class RoomController {
  constructor({ roomService,messageService }) {
    this.roomService = roomService;
    this.messageService = messageService;
  }
  createRoom = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const roomData = req.body || {};
      if (req.files) {
        if (req.files["avatar"]) {
          roomData.roomAvatar = req.files["avatar"][0].path;
        }
        if (req.files["banner"]) {
          roomData.roomBanner = req.files["banner"][0].path;
        }
      }
      const result = await this.roomService.createRoom(userId, roomData);
      res.status(201).json({
        success: true,
        roomId: result.id || result._id,
        slug: result.slug,
      });
    } catch (error) {
      next(error);
    }
  };
  getRoomBySlug = async (req, res, next) => {
    try {
      const slug = req.params.slug; 
      const cleanRoom = await this.roomService.getRoomBySlug(slug);
      res.status(200).json({ room: cleanRoom });
    } catch (error) {
      next(error);
    }
  };
  joinRoom = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { roomId } = req.params;
      const { password } = req.body;

      const result = await this.roomService.joinRoom(userId, roomId, password);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
  leaveRoom = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { roomId } = req.params;

      const result = await this.roomService.leaveRoom(userId, roomId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
  getAllRooms = async (req, res, next) => {
    try {
      const rooms = await this.roomService.getAllRooms();
      res.status(200).json(rooms || []);
    } catch (error) {
      console.error("Odalar getirilirken bir sorun oluştu.", error.message);
      res.status(200).json([]);
    }
  };
  uploadAvatar = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const roomId = req.params.roomId;
      const fileUrl = req.file?.path;
      const result = await this.roomService.updateAvatar(
        roomId,
        userId,
        fileUrl,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  uploadBanner = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const roomId = req.params.roomId;
      const fileUrl = req.file?.path;

      const result = await this.roomService.updateBanner(
        roomId,
        userId,
        fileUrl,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  deleteRoom = async (req, res, next) => {
    try {
      const roomId = req.params.roomId;
      const userId = req.user.id; 
      
      const result = await this.roomService.deleteRoom(roomId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  getRoomMessages = async(req,res,next) => {
    try {
    const messages = await  this.messageService.getHistory(req.params.roomId);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("💥 MESAJ GEÇMİŞİ ÇEKİLİRKEN PATLADI:", error);
    res.status(500).json({ success: false, message: "Hata oluştu" });
  }
  }
  inviteUser = async(req,res,next) => {
    try {
      const currentUserId = req.user._id || req.user.id; 
      const { roomId } = req.params;
      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ message: "Lütfen davet edilecek bir kullanıcı seçin!" });
      }
      const result = await this.roomService.inviteUserToRoom(currentUserId, targetUserId, roomId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoomController;
