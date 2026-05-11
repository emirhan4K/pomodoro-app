class ProfileMapper {
  static toResponse(user, profileDoc) {
    // 1. GİZLİ HATA BURADAYDI! 'profile' değil 'profileDoc' kontrol ediliyor.
    if (!profileDoc) return null; 

    return {
      id: user?._id ? user._id.toString() : (user?.id || ""),
      username: user?.username || "Kullanıcı",
      email: user?.email || "",
      title: profileDoc.title || "",
      settings: profileDoc.settings || {},
      avatar: profileDoc.avatar || "default-avatar.png",
      banner: profileDoc.banner || "default-banner.png",
      joinedAt: user?.createdAt,
      xp: profileDoc.xp || 0,
      level: profileDoc.level || 1,
      totalPomodoros: profileDoc.totalPomodoros || 0,
      totalWorkTime: profileDoc.totalWorkTime || 0,
      currentStreak: profileDoc.currentStreak || 0,
      bestStreak: profileDoc.bestStreak || 0,
      lastSessionDate: profileDoc.lastSessionDate || null,
      // 2. DİĞER GİZLİ HATA: profile.followers değil profileDoc.followers
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
    return profiles.map((p) => this.toBasicProfileDto(p));
  }
}

module.exports = ProfileMapper;