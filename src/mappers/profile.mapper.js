class ProfileMapper {
  static toResponse(user, stats) {
    return {
      username: user.username,
      email: user.email,
      joinedAt: user.createdAt,
      stats: {
        totalPomodoros: stats ? stats.totalPomodoros : 0,
        totalWorkTime: stats ? (stats.totalWorkTime / 60).toFixed(1) : 0,
      },
    };
  }
}

module.exports = ProfileMapper;
