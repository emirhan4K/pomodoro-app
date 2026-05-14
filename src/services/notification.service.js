const { getIo } = require("../sockets/index");
const BadRequestException = require("../exceptions/BadRequestException");
const NotificationMapper = require("../mappers/notification.mapper");

class NotificationService {
  constructor({ notificationRepository }) {
    this.notificationRepository = notificationRepository;
  }
  async createNotification(data) {
    const create = await this.notificationRepository.create(data);
    const notificationDto = NotificationMapper.toDto(create);
    const io = getIo();
    if (io && data.recipient) {
      io.to(data.recipient.toString()).emit("new_notification", notificationDto);
      console.log(`📡 Bildirim ${data.recipient} odasına fırlatıldı!`);
    }
    return notificationDto;
  }
  async getUserNotifications(userId) {  //Kullanıcının geçmiş bildirimlerini getirecek.
    const notifications = await this.notificationRepository.find({ recipient: userId });
    return NotificationMapper.toDtoList(notifications.reverse());
  }
 async markAsRead(userId, notificationId) {
    const notification = await this.notificationRepository.findOne({ 
      _id: notificationId, 
      recipient: userId 
    });
    if (!notification) {
      throw new BadRequestException("Bildirim bulunamadı veya yetkiniz yok!");
    }
    const updatedNotification = await this.notificationRepository.update(notificationId, { 
      isRead: true 
    });

    return NotificationMapper.toDto(updatedNotification);
  }
}

module.exports = NotificationService;
