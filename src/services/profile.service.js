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
  async gainXp(userId, earnedXp){
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new BadRequestException("Profil bulunamadı!"); 
    }
    let xp = profile.xp;
    let level = profile.level;
    xp += earnedXp; // XP'yi ekle
    
    let requiredXp = Math.floor(level * 100 * 1.5); // 4. Seviye atlama formülü ve kontrolü
    if(xp >= requiredXp){
      level += 1;
    }
    await this.profileRepository.update(profile._id,{
      xp,
      level,
    })
    return { xp, level };
  }
}

module.exports = ProfileService;