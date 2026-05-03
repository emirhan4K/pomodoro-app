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
}

module.exports = PomodoroService;