const { getIo } = require("../sockets/index");
const BadRequestException = require("../exceptions/BadRequestException");
const NotificationMapper = require("../mappers/notification.mapper");

class NotificationService {
  constructor({ notificationRepository }) {
    this.notificationRepository = notificationRepository;
  }
  async createNotification(data) {
    // 1. Kaydı oluştur
    const savedNotif = await this.notificationRepository.create(data);
    
    // 2. Mapper'dan geçir (savedNotif'i gönderiyoruz!)
    const notificationDto = NotificationMapper.toDto(savedNotif);

    // 3. Socket ile fırlat
    const io = getIo();
    if (io && data.recipient) {
      const room = data.recipient.toString();
      io.to(room).emit("new_notification", notificationDto);
      console.log(`📡 SOCKET: Bildirim ${room} odasına başarıyla fırlatıldı!`);
    }

    return savedNotif;
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
  async markAllAsRead(userId) {
    // Kullanıcıya ait okunmamış tüm bildirimleri bul ve isRead: true yap
    await this.notificationRepository.model.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return { success: true, message: "Tüm bildirimler okundu." };
  }
}

module.exports = NotificationService;
