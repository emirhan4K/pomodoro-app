class NotificationController {
  constructor({ notificationService }) {
    this.notificationService = notificationService;
  }
  getUserNotifications = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const result =
        await this.notificationService.getUserNotifications(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  markAsRead = async (req, res, next) => {
    try {
      const notificationId = req.params.id;
      const result =
        await this.notificationService.markAsRead(notificationId);
      res.status(200).json({success: true, data: result});
    } catch (error) {
      next(error);
    }
  };
  markAllAsRead=  async(req, res, next) => {
    try {
      const userId = req.user.id; 
      const result = await this.notificationService.markAllAsRead(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
