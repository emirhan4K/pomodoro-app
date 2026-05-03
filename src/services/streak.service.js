const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");

class StreakService {
  constructor({ profileRepository }) {
    this.profileRepository = profileRepository;
  }
  async calculateStreak(currentStreak, bestStreak, lastSessionDate) {
    const now = new Date();
    if (!lastSessionDate) {
      return {
        currentStreak: 1,
        bestStreak: Math.max(1, bestStreak),
        lastSessionDate: now,
      };
    }

    // Yerel zamanda tarih nesneleri oluştur
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(
      lastSessionDate.getFullYear(),
      lastSessionDate.getMonth(),
      lastSessionDate.getDate(),
    );

    // Gün farkını hesapla
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Bugün zaten yapmış
      return {
        currentStreak: currentStreak,
        bestStreak: bestStreak,
        lastSessionDate: now,
      };
    } else if (diffDays === 1) {
      // Dün yapmış, bugün yapıyor - Seri artar
      const newStreak = currentStreak + 1;
      return {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, bestStreak),
        lastSessionDate: now,
      };
    } else {
      // Aradan 1 günden fazla geçmiş - Seri sıfırla
      return {
        currentStreak: 1,
        bestStreak: bestStreak,
        lastSessionDate: now,
      };
    }
  }
}

module.exports = StreakService;
