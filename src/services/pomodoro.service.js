const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const PomodoroMapper = require("../mappers/pomodoro.mapper");

class PomodoroService {
  constructor({
    pomodoroRepository,
    statisticRepository,
    profileRepository,
    profileService,
    streakService
  }) {
    this.pomodoroRepository = pomodoroRepository;
    this.statisticRepository = statisticRepository;
    this.profileService = profileService;
    this.profileRepository = profileRepository;
    this.streakService = streakService;
  }
  async createSession(userId, bodyData) { //Pomodoro oluştur
    const { category, duration } = bodyData;

    const newSession = await this.pomodoroRepository.create({
      user: userId,
      duration,
      category,
    });
    return { newSession: PomodoroMapper.toResponse(newSession) };
  }
  async updateSessionStatus(sessionId, userId, status) { //Pomodoro durumunu güncelle
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
    const updatedSession = await this.pomodoroRepository.update(sessionId, {
      status,
    });
    const cleanId = userId?.user || userId?.id || userId;

    if (status === "completed") {
      // Orijinal istatistik güncelleme kodun (Aynen kaldı)
      await this.statisticRepository.incrementStats(cleanId, session.duration);
      
      if (this.profileRepository) {
        const profile = await this.profileRepository.findByUserId(cleanId);
        const { currentStreak, bestStreak, lastSessionDate } = await this.streakService.calculateStreak(
            profile?.currentStreak || 0,
            profile?.bestStreak || 0,
            profile?.lastSessionDate || null
        );
        await this.profileRepository.updateStats(
            cleanId, 
            session.duration,
            currentStreak,
            bestStreak,
            lastSessionDate
        );
      }
      await this.profileService.gainXp(cleanId, session.duration);
    }
    return { updatedSession: PomodoroMapper.toResponse(updatedSession) };
  }
  async getUserHistory(userId) {
    //Geçmiş pomodoroları getir
    const pomodoros = await this.pomodoroRepository.getUserHistory(userId);
    return pomodoros.map((pomodoro) => PomodoroMapper.toResponse(pomodoro));
  }
}

module.exports = PomodoroService;
