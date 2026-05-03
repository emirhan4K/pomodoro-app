const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const PomodoroMapper = require("../mappers/pomodoro.mapper");

class PomodoroService {
  constructor({
    pomodoroRepository,
    statisticRepository,
    profileRepository,
    profileService,
    streakService,
  }) {
    this.pomodoroRepository = pomodoroRepository;
    this.statisticRepository = statisticRepository;
    this.profileService = profileService;
    this.profileRepository = profileRepository;
    this.streakService = streakService;
  }

  async createSession(userId, bodyData) {
    const { category, duration } = bodyData;
    const newSession = await this.pomodoroRepository.create({
      user: userId,
      duration,
      category,
    });
    return { newSession: PomodoroMapper.toResponse(newSession) };
  }

  async updateSessionStatus(sessionId, userId, status) {
    const allowedStatuses = ["running", "paused", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException("Geçersiz Pomodoro durumu!");
    }

    const session = await this.pomodoroRepository.findById(sessionId);
    if (!session) {
      throw new BadRequestException("Pomodoro bulunamadı!");
    }

    if (session.user.toString() !== userId.toString()) {
      throw new UnauthorizedException("Bu oturumu değiştiremezsiniz.");
    }

    const updatedSession = await this.pomodoroRepository.update(sessionId, { status });
    
    // Güvenli ID temizliği
    const cleanId = (userId && typeof userId === "object") ? (userId.id || userId._id || userId.user) : userId;
    const cleanIdStr = cleanId.toString();

    let updatedProfile = null;

    if (status === "completed") {
      // İstatistik Güncelleme (Geçmiş kodundan gelen kısım)
      if (this.statisticRepository && this.statisticRepository.incrementStats) {
         await this.statisticRepository.incrementStats(cleanIdStr, session.duration);
      }

      if (this.profileRepository) {
        const profile = await this.profileRepository.findByUserId(cleanIdStr);
        
        // Seri Hesapla
        const streakData = await this.streakService.calculateStreak(
          profile?.currentStreak || 0,
          profile?.bestStreak || 0,
          profile?.lastSessionDate || null
        );

        // İstatistikleri kaydet
        await this.profileRepository.updateStats(
          cleanIdStr,
          session.duration,
          streakData.currentStreak,
          streakData.bestStreak,
          streakData.lastSessionDate
        );
      }

      // XP Kazan
      await this.profileService.gainXp(cleanIdStr, session.duration);
      
      // Profilin en güncel halini döndür
      updatedProfile = await this.profileService.getUserProfile(cleanIdStr);
    }

    return {
      updatedSession: PomodoroMapper.toResponse(updatedSession),
      updatedProfile,
    };
  }

  async getUserHistory(userId) {
    const pomodoros = await this.pomodoroRepository.getUserHistory(userId);
    return pomodoros.map((pomodoro) => PomodoroMapper.toResponse(pomodoro));
  }
  async getDailyDashboardStats(userId) {
    const cleanId = userId && typeof userId === "object" ? userId.id || userId._id || userId.user : userId;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySessions = await this.pomodoroRepository.model.find({
      user: cleanId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const completedSessions = todaySessions.filter(s => s.status === "completed");
    const todayFocusMinutes = completedSessions.reduce((acc, curr) => acc + curr.duration, 0);
    const todayFocusHours = (todayFocusMinutes / 60).toFixed(1);

    const totalAttempted = todaySessions.filter(s => s.status === "completed" || s.status === "cancelled").length;
    const efficiency = totalAttempted === 0 ? 0 : Math.round((completedSessions.length / totalAttempted) * 100);

    const categoryMap = {};
    completedSessions.forEach(s => {
      const cat = s.category || "Diğer";
      categoryMap[cat] = (categoryMap[cat] || 0) + s.duration;
    });

    const colors = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];
    const categoryData = Object.keys(categoryMap).map((key, index) => ({
      name: key,
      value: categoryMap[key],
      color: colors[index % colors.length]
    }));

    const hourlyMap = {};
    for (let i = 8; i <= 23; i++) {
      hourlyMap[`${i.toString().padStart(2, "0")}:00`] = 0;
    }

    completedSessions.forEach(s => {
      const hour = new Date(s.createdAt).getHours();
      const hourKey = `${hour.toString().padStart(2, "0")}:00`;
      if (hourlyMap[hourKey] !== undefined) {
        hourlyMap[hourKey] += s.duration;
      } else {
        hourlyMap[hourKey] = s.duration;
      }
    });

    const hourlyData = Object.keys(hourlyMap).map(key => ({
      time: key,
      duration: hourlyMap[key]
    }));

    const recentSessions = [...todaySessions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map(s => ({
        id: s._id,
        category: s.category || "Diğer",
        time: new Date(s.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        duration: `${s.duration} dk`,
        status: s.status === "completed" ? "Tamamlandı" : (s.status === "cancelled" ? "İptal" : s.status)
      }));

    return {
      todayFocusHours,
      todaySessionsCount: completedSessions.length,
      efficiency,
      categoryData: categoryData.length > 0 ? categoryData : [{ name: "Veri Yok", value: 1, color: "#334155" }],
      hourlyData,
      recentSessions
    };
  }
}

module.exports = PomodoroService;