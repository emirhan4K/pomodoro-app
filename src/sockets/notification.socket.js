module.exports = (io, socket) => {
  const joinUserRoom = (userId) => {
    socket.join(userId);
    console.log(`👤 SOCKET: Kullanıcı kendi özel odasına bağlandı: ${userId}`);
  };

  socket.on("join_user_room", joinUserRoom);
};