module.exports = (io, socket) => {
  
  // Kullanıcının kişisel bildirim odasına katılması
  const joinUserRoom = (userId) => {
    socket.join(userId);
     console.log(`👤 Kullanıcı özel odasına girdi: ${userId}`);
  };

  socket.on("join_user_room", joinUserRoom);
};