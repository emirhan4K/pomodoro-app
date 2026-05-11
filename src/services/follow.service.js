const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const ProfileMapper = require("../mappers/profile.mapper");

class FollowService {
  constructor({ profileRepository }) {
    this.profileRepository = profileRepository;
  }
  async follow(currentUserId, targetUserId) { 
    if (currentUserId === targetUserId) {
      throw new UnauthorizedException("Kendini takip edemezsin!");
    }
    const target = await this.profileRepository.findByUserId(targetUserId);
    if (!target) {
      throw new BadRequestException("Kullanıcı bulunamadı");
    }
    const updated = await this.profileRepository.followUser(
      currentUserId,
      targetUserId,
    );
    return updated;
  }
  async unfollow(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      throw new UnauthorizedException("Kendini takip edemezsin!");
    }
    const target = await this.profileRepository.findByUserId(targetUserId);
    if (!target) {
      throw new BadRequestException("Kullanıcı bulunamadı");
    }
    const updated = await this.profileRepository.unfollowUser(
      currentUserId,
      targetUserId,
    );
    return updated;
  }
  async getFollowers(targetId) { //Takipçileri Getir
    const followers = await this.profileRepository.getFollowersList(targetId);
    return ProfileMapper.toBasicProfileListDto(followers);
  }
  async getFollowing(userId) { //Takip Ettiklerini Getir
    const following = await this.profileRepository.getFollowingList(userId);
    return ProfileMapper.toBasicProfileListDto(following);
  }
}

module.exports = FollowService;
