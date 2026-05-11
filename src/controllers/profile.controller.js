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
  updateProfileInfo = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const {name,title} = req.body;
      const result = await this.profileService.updateProfileInfo(userId,{ name, title });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  updateUserSettings = async (req,res,next)=>{
    try {
      const userId = req.user.id;
      const settingsData = req.body;
      const result = await this.profileService.updateUserSettings(userId,settingsData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  changePasswordSettings = async(req,res,next) => {
    try {
      const userId = req.user.id
      const {oldPassword,newPassword} = req.body;
      const result = await this.profileService.changePasswordSettings(userId,oldPassword,newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }
  deleteAccount = async (req,res,next) => {
    try {
      const userId = req.user.id
      const result = await this.profileService.deleteAccount(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }
  uploadAvatar = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const fileUrl = req.file?.path;
      const result = await this.profileService.updateAvatar(userId, fileUrl);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  uploadBanner = async (req,res,next) => {
    try {
      const userId = req.user.id;
      const fileUrl = req.file?.path;
      const result = await this.profileService.updateBanner(userId, fileUrl);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = ProfileController;
