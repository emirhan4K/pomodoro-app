class RoomController {
  constructor({ roomService }) {
    this.roomService = roomService;
  }
  createRoom = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const roomData = req.body || {};
      if (req.files) {
        if (req.files["avatar"]) {
          roomData.roomAvatar = `/public/uploads/rooms/avatars/${req.files["avatar"][0].filename}`;
        }
        if (req.files["banner"]) {
          roomData.roomBanner = `/public/uploads/rooms/banners/${req.files["banner"][0].filename}`;
        }
      }
      const result = await this.roomService.createRoom(userId, roomData);
      res.status(201).json({
        success: true,
        roomId: result.id || result._id,
      });
    } catch (error) {
      next(error);
    }
  };
  getRoomById = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      const cleanRoom = await this.roomService.getRoomById(roomId);
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
      console.error("ODALARI GETİRİRKEN PATLADI:", error.message);
      res.status(200).json([]);
    }
  };
  uploadAvatar = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const roomId = req.params.roomId;
      const filename = req.file?.filename;
      const result = await this.roomService.updateAvatar(
        roomId,
        userId,
        filename,
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
      const filename = req.file?.filename;

      const result = await this.roomService.updateBanner(
        roomId,
        userId,
        filename,
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
}

module.exports = RoomController;
