class RoomController {
  constructor({ roomService }) {
    this.roomService = roomService;
  }
  createRoom = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const roomData = req.body;
      const result = await this.roomService.createRoom(userId, roomData);
      res.status(201).json(result);
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
 
}

module.exports = RoomController;
