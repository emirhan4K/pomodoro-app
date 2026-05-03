const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");

class StreakService {
  constructor({ profileRepository }) {
    this.profileRepository = profileRepository;
  }
  async calculateStreak(currentStreak, bestStreak, lastSessionDate) {
    const now = new Date();
    if (!lastSessionDate) {
      //Kullanıcı hesabını açmış ama hiç pomodoro bitirmemişse
      return {
        currentStreak: 1,
        bestStreak: Math.max(1, bestStreak),
        lastSessionDate: now,
      };
    }
    //Saatleri Sıfırlama
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastDate = new Date(lastSessionDate).setHours(0, 0, 0, 0);

    //Gün Farkını Hesaplama
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      //Bugün zaten yapmış değerler bozulmadan aynen döner
      return {
        currentStreak: currentStreak,
        bestStreak: bestStreak,
        lastSessionDate: now,
      };
    } else if (diffDays === 1) {
      //Dün yapmış bugün de yapıyor, Seri artar!
      const newStreak = currentStreak + 1;
      return {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, bestStreak),
        lastSessionDate: now,
      };
    } else {
      //Aradan 1 günden fazla geçmiş, Seri kırıldı.
      return {
        currentStreak: 1, // Yeni baştan başlıyor
        bestStreak: bestStreak, // Rekor aynen kalıyor
        lastSessionDate: now,
      };
    }
  }
}

module.exports = StreakService;
