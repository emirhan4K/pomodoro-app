const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const ProfileMapper = require("../mappers/profile.mapper");

class BlockService {
  constructor({ profileRepository }) {
    this.profileRepository = profileRepository;
  }
  async blockUser(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) return;
    const target = await this.profileRepository.findByUserId(targetUserId);
    if (!target) throw new BadRequestException("Kullanıcı bulunamadı!");
    await this.profileRepository.unfollowUser(currentUserId,targetUserId); //Sen onu takipten çık
    await this.profileRepository.unfollowUser(targetUserId, currentUserId); //O da seni takipten çıksın
    const block = await this.profileRepository.blockUser(currentUserId,targetUserId);
    return block;
  }
  async unblockUser(currentUserId, targetUserId){
    const unblock = await this.profileRepository.unblockUser(currentUserId, targetUserId);
    return unblock;
  }
}

module.exports = BlockService;
