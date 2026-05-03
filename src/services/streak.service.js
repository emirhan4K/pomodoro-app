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
    const last = new Date(lastSessionDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());

    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const fixedStreak = currentStreak === 0 ? 1 : currentStreak;
      
      return {
        currentStreak: fixedStreak,
        bestStreak: Math.max(fixedStreak, bestStreak),
        lastSessionDate: now,
      };
    } else if (diffDays === 1) {
      const newStreak = currentStreak + 1;
      return {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, bestStreak),
        lastSessionDate: now,
      };
    } else {
      return {
        currentStreak: 1,
        bestStreak: bestStreak,
        lastSessionDate: now,
      };
    }
  }
}

module.exports = StreakService;