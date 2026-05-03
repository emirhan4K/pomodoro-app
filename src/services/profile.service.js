const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const ProfileMapper = require("../mappers/profile.mapper");

class ProfileService {
  constructor({ profileRepository, userRepository }) {
    this.profileRepository = profileRepository;
    this.userRepository = userRepository;
  }
  async getUserProfile(userId) {
    const user = await this.userRepository.findById(userId);
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
        profile = {
            xp: 0,
            level: 1,
            totalPomodoros: 0,
            totalWorkTime: 0
        };
    }
    return ProfileMapper.toResponse(user, profile);
}
  async handleCompletedPomodoro(userId, duration) {
    return await this.profileRepository.updateStats(userId, duration);
  }
  async getPublicProfile(targetUserId) {
    //Kullanıcının profilini başkaları dışarıdan görüntüler
    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      throw new BadRequestException("Kullanıcı bulunamadı!");
    }

    const profile = await this.profileRepository.findByUserId(targetUserId);
    return ProfileMapper.toResponse(user, profile);
  }
  async gainXp(userId, earnedXp) {
    const cleanId = userId?.user || userId?.id || userId;
    const profile = await this.profileRepository.findByUserId({ user: userId });
    if (!profile) {
      profile = await this.profileRepository.create({
        user: cleanId,
        xp: 0,
        level: 1,
        totalPomodoros: 0,
        totalWorkTime: 0,
      });
    }
    let xp = profile.xp + earnedXp;
    let level = profile.level;

    let requiredXp = Math.floor(level * 100 * 1.5); //Seviye atlama formülü ve kontrolü
    if (xp >= requiredXp) {
      level += 1;
    }
    await this.profileRepository.update(profile._id, {
      xp,
      level,
    });
    return { xp, level };
  }
}

module.exports = ProfileService;
