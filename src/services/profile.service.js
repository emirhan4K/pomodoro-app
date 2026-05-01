const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const ProfileMapper = require("../mappers/profile.mapper");

class ProfileService {
  constructor({ profileRepository, userRepository }) {
    this.profileRepository = profileRepository;
    this.userRepository = userRepository;
  }
  async getUserProfile(userId) { //Kullanıcının kendi bilgilerini getirir
    const user = await this.userRepository.findById(userId);
    const profile = await this.profileRepository.findByUserId(userId);
    
    return ProfileMapper.toResponse(user, profile);
  }
  async handleCompletedPomodoro(userId, duration) { //Tamamlanan bir pomodoro sonrası istatistikleri günceller
    return await this.profileRepository.updateStats(userId, duration);
  }
  async getPublicProfile(targetUserId) { //Kullanıcının profilini başkaları dışarıdan görüntüler
  const user = await this.userRepository.findById(targetUserId);
  if (!user) {
    throw new BadRequestException("Kullanıcı bulunamadı!");
  }
  
  const profile = await this.profileRepository.findByUserId(targetUserId);
  return ProfileMapper.toResponse(user, profile);
}
}

module.exports = ProfileService;