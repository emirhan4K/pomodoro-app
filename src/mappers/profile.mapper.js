class ProfileMapper {
  static toResponse(user, profileDoc) {
    return {
      id: user._id ? user._id.toString() : user.id,
      username: user?.username || user?.name,
      email: user?.email,
      title: profileDoc?.title,
      settings: profileDoc?.settings,
      avatar: profileDoc?.avatar,
      banner: profileDoc?.banner || 'default-banner.png',
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