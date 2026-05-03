class ProfileMapper {
  static toResponse(user, stats) {
    return {
      username: user.username,
      email: user.email,
      joinedAt: user.createdAt,
      xp: stats ? stats.xp : 0,
      level: stats ? stats.level : 1,
      stats: {
        totalPomodoros: stats ? stats.totalPomodoros : 0,
        totalWorkTime: stats ? (stats.totalWorkTime / 60).toFixed(1) : 0,
      },
    };
  }
}

module.exports = ProfileMapper;