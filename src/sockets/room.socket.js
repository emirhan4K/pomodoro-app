module.exports = (io, socket) => {
  //Odaya Katılma
  const joinRoom = ({ roomId, user }) => {
    socket.join(roomId);
    console.log(`${user?.username || 'Biri'} [${roomId}] odasına katıldı.`);

    // Odadaki diğer kişilere haber ver
    socket.to(roomId).emit("user_joined", {
      message: `${user?.username || 'Biri'} odaya katıldı!`,
      user: user
    });
  };

  // Odadan Ayrılma
  const leaveRoom = ({ roomId, user }) => {
    socket.leave(roomId);
    console.log(`${user?.username || 'Biri'} [${roomId}] odasından ayrıldı.`);

    socket.to(roomId).emit("user_left", {
      message: `${user?.username || 'Biri'} odadan ayrıldı.`,
      user: user
    });
  };

  socket.on("join_room", joinRoom);
  socket.on("leave_room", leaveRoom);
};