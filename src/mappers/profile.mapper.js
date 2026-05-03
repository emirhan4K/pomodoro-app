class ProfileMapper {
  static toResponse(user, profileDoc) {
    return {
      username: user?.username,
      email: user?.email,
      joinedAt: user?.createdAt,
      xp: profileDoc ? profileDoc.xp : 0,
      level: profileDoc ? profileDoc.level : 1,
      totalPomodoros: profileDoc ? profileDoc.totalPomodoros : 0,
      totalWorkTime: profileDoc ? profileDoc.totalWorkTime : 0, 
      currentStreak: profileDoc ? profileDoc.currentStreak : 0,
      bestStreak: profileDoc ? profileDoc.bestStreak : 0,
      lastSessionDate: profileDoc ? profileDoc.lastSessionDate : null,
    };
  }
}

module.exports = ProfileMapper;