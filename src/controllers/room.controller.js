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
}

module.exports = RoomController;
