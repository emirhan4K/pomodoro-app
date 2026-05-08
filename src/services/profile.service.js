const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const ProfileMapper = require("../mappers/profile.mapper");
const fs = require('fs');
const path = require('path');

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
        totalWorkTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastSessionDate: null,
      };
    }
    return ProfileMapper.toResponse(user, profile);
  }
  async handleCompletedPomodoro(userId, duration) {
    return await this.profileRepository.updateStats(userId, duration);
  }
  async getPublicProfile(targetUserId) {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) throw new BadRequestException("Kullanıcı bulunamadı!");

    const profile = await this.profileRepository.findByUserId(targetUserId);
    return ProfileMapper.toResponse(user, profile);
  }
  async gainXp(userId, earnedXp) {
    const cleanId = userId?.id || userId?._id || userId;
    let profile = await this.profileRepository.findByUserId(cleanId);

    if (!profile) {
      profile = await this.profileRepository.create({
        user: cleanId,
        xp: 0,
        level: 1,
        totalPomodoros: 0,
        totalWorkTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastSessionDate: null,
      });
    }

    let xp = profile.xp + earnedXp;
    let level = profile.level;

    // Seviye atlama kontrolü
    let requiredXp = Math.floor(level * 100 * 1.5);
    if (xp >= requiredXp) {
      level += 1;
    }

    await this.profileRepository.update(profile._id, { xp, level });
    return { xp, level };
  }
  async updateProfileInfo(userId, { name, title }) {
    const updatedUser = await this.userRepository.model.findByIdAndUpdate(
      userId,
      { username: name, username: name }, 
      { new: true }
    ).select('-password');

    const updatedProfile = await this.profileRepository.model.findOneAndUpdate(
      { user: userId }, 
      { title: title },
      { new: true }
    );
    return ProfileMapper.toResponse(updatedUser, updatedProfile);
  }
  async updateUserSettings(userId, settingsData) {
    const updatedProfile = await this.profileRepository.model.findOneAndUpdate(
      { user: userId },
      { $set: { settings: settingsData } }, 
      { new: true }
    );
    const user = await this.userRepository.model.findById(userId).select('-password');
    
    return ProfileMapper.toResponse(user, updatedProfile);
  }
  async changePasswordSettings(userId,oldPassword,newPassword){
    const user = await this.userRepository.findById(userId)
    if(!user) throw new BadRequestException("Kullanıcı bulunamadı!")
      
    const isMatch = await comparePassword(oldPassword,user.password)
    if(!isMatch) throw new UnauthorizedException("Mevcut şifreniz yanlış")

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    return { message: 'Şifreniz başarıyla güncellendi.' };
  }
  async deleteAccount(userId) {
    const deletedUser = await this.userRepository.model.findByIdAndDelete(userId);
    if (!deletedUser) throw new BadRequestException('Kullanıcı bulunamadı veya zaten silinmiş.');
    return { message: 'Hesabınız başarıyla silindi.' };
  }
  async updateAvatar(userId, fileUrl) {
    if (!fileUrl) {
      throw new BadRequestException("Lütfen geçerli bir resim dosyası seçin!");
    }
    const updatedProfile = await this.profileRepository.model.findOneAndUpdate(
      { user: userId },
      { avatar: fileUrl },
      { new: true }
    );

    const user = await this.userRepository.model.findById(userId).select('-password');
    return ProfileMapper.toResponse(user, updatedProfile);
  }
  async updateBanner(userId, fileUrl) {
    if (!fileUrl) {
      throw new BadRequestException("Lütfen geçerli bir arka plan dosyası seçin!");
    }
    const updatedProfile = await this.profileRepository.model.findOneAndUpdate(
      { user: userId },
      { banner: fileUrl },
      { new: true }
    );

    const user = await this.userRepository.model.findById(userId).select('-password');
    return ProfileMapper.toResponse(user, updatedProfile);
  }
}

module.exports = ProfileService;
