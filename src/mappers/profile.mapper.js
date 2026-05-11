class ProfileMapper {
  static toResponse(user, profileDoc) {
    if (!!profileDoc) return null;
    return {
      id: user._id ? user._id.toString() : user.id,
      username: user?.username || user?.name,
      email: user?.email,
      title: profileDoc?.title,
      settings: profileDoc?.settings,
      avatar: profileDoc?.avatar,
      banner: profileDoc?.banner || "default-banner.png",
      joinedAt: user?.createdAt,
      xp: profileDoc ? profileDoc.xp : 0,
      level: profileDoc ? profileDoc.level : 1,
      totalPomodoros: profileDoc ? profileDoc.totalPomodoros : 0,
      totalWorkTime: profileDoc ? profileDoc.totalWorkTime : 0,
      currentStreak: profileDoc ? profileDoc.currentStreak : 0,
      streak: profileDoc ? profileDoc.currentStreak : 0,
      bestStreak: profileDoc ? profileDoc.bestStreak : 0,
      lastSessionDate: profileDoc ? profileDoc.lastSessionDate : null,
      social: {
        followers: profileDoc.followers || [],
        following: profileDoc.following || []
      }
    };
  }
  static toBasicProfileDto(profile) {
    if (!profile) return null;

    const userData = profile.user && typeof profile.user === 'object' ? profile.user : {};

    return {
      userId: userData._id || profile.user,
      username: userData.username || "Kullanıcı",
      avatar: profile.avatar || "default-avatar.png",
      title: profile.title || "",
      followers: profile.followers || [],
      following: profile.following || []
    };
  }
  static toBasicProfileListDto(profiles) {
    if (!profiles || !Array.isArray(profiles)) return [];
    return profiles.map((profile) => this.toBasicProfileDto(profile));
  }
}

module.exports = ProfileMapper;
