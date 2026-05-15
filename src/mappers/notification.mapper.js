class NotificationMapper {
  static toDto(notification) {
    if (!notification) return null;

    return {
      id: notification._id,
      recipient: notification.recipient,
      sender: notification.sender || null,
      type: notification.type,
      content: notification.content,
      isRead: notification.isRead,
      avatar: notification.avatar,
      createdAt: notification.createdAt,
    };
  }

  static toDtoList(notifications) {
    if (!notifications || !Array.isArray(notifications)) return [];
    
    return notifications.map(notification => this.toDto(notification));
  }
}

module.exports = NotificationMapper;