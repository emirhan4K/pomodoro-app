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
    //Pomodoro oluştur
    const { category, duration } = bodyData;

    const newSession = await this.pomodoroRepository.create({
      user: userId,
      duration,
      category,
    });
    return { newSession: PomodoroMapper.toResponse(newSession) };
  }
  async updateSessionStatus(sessionId, userId, status) {
    //Pomodoro durumunu güncelle
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
    const cleanId =
      userId && typeof userId === "object"
        ? userId.id || userId._id || userId.user
        : userId;

    if (status === "completed") {
      await this.statisticRepository.incrementStats(cleanId, session.duration);

      if (this.profileRepository) {
        const profile = await this.profileRepository.findByUserId(cleanId);
        console.log("✅ Profil bulundu:", {
          found: !!profile,
          currentStreak: profile?.currentStreak,
          bestStreak: profile?.bestStreak,
        });

        const streakCalc = await this.streakService.calculateStreak(
          profile?.currentStreak || 0,
          profile?.bestStreak || 0,
          profile?.lastSessionDate || null,
        );
        console.log("✅ Streak hesaplandı:", streakCalc);

        const updated = await this.profileRepository.updateStats(
          cleanId,
          session.duration,
          streakCalc.currentStreak,
          streakCalc.bestStreak,
          streakCalc.lastSessionDate,
        );
        console.log("✅ Profil güncellendi:", {
          currentStreak: updated?.currentStreak,
          bestStreak: updated?.bestStreak,
        });
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
