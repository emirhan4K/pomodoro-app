class ProfileController {
  constructor({ profileService }) {
    this.profileService = profileService;
  }

  getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileData = await this.profileService.getUserProfile(userId);
    res.status(200).json(profileData); 
    
  } catch (error) {
    next(error);
  }
};

  getPublicProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const profile = await this.profileService.getPublicProfile(targetUserId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
}

module.exports = ProfileController;