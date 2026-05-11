// ÇÖZÜM: Senin o muazzam container'ını buraya çağırıp servisi çekiyoruz!
const container = require("../config/container");
const messageService = container.resolve("messageService");

module.exports = (io, socket) => {
  
  // Odaya Katılma
  const joinRoom = ({ roomId, user }) => {
    socket.join(roomId);
    socket.to(roomId).emit("user_joined", {
      message: `${user?.username || 'Biri'} odaya katıldı!`,
      user: user
    });
  };

  // Odadan Ayrılma
  const leaveRoom = ({ roomId, user }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user_left", {
      message: `${user?.username || 'Biri'} odadan ayrıldı.`,
      user: user
    });
  };

  // Sayaç Senkronizasyonu
  const syncTimer = (data) => {
    socket.to(data.roomId).emit("timer_updated", data);
  };

  // Yazıyor... (Typing)
  const handleTyping = ({ roomId, username, isTyping }) => {
    socket.to(roomId).emit("user_typing", { username, isTyping });
  };

  // Görüldü (Seen)
  const handleMessageSeen = async ({ roomId, messageId, userId }) => {
    try {
      await messageService.markAsSeen(messageId, userId);
      socket.to(roomId).emit("message_seen_update", { messageId, userId });
    } catch (error) {
      console.error("Seen Hatası:", error);
    }
  };

  // MESAJIN DB'YE YAZILDIĞI VE ÇÖZÜLEN YER
  const sendChatMessage = async (data) => {
    try {
      const { roomId, message, user } = data;
      const newMessage = await messageService.saveMessage(roomId, user, message);
      
      io.to(roomId).emit("new_message", {
        _id: newMessage._id,
        text: newMessage.text,
        username: newMessage.username,
        createdAt: newMessage.createdAt,
        user: { 
          _id: newMessage.user, 
          avatar: user.avatar 
        }
      });
      
    } catch (error) {
      console.error("❌ Socket Chat Hatası:", error);
    }
  };

  socket.on("join_room", joinRoom);
  socket.on("leave_room", leaveRoom);
  socket.on("sync_timer", syncTimer);
  socket.on("send_message", sendChatMessage);
  socket.on("typing", handleTyping);
  socket.on("mark_seen", handleMessageSeen);
};