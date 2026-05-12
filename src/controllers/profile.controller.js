class ProfileController {
  constructor({ profileService }) {
    this.profileService = profileService;
  } 
  
  getProfile = async (req, res, next) => {
    try {
      // 1. GÜVENLİK: id veya _id hangisi geliyorsa al
      const userId = req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ message: "Token'dan kullanıcı kimliği okunamadı." });
      }

      // 2. Servisten veriyi çek
      const profileData = await this.profileService.getUserProfile(userId);
      
      if (!profileData) {
         return res.status(404).json({ message: "Profil datası null döndü." });
      }

      res.status(200).json(profileData);
    } catch (error) {
      // 3. KÖR NOKTAYI AÇIYORUZ: Hatayı next(error) ile gizleme, direkt frontend'e bas!
      console.error("🔥 GET PROFILE DETAYLI HATA:", error);
      res.status(500).json({ 
        success: false, 
        message: "Backend Çöktü!", 
        errorDetail: error.message, 
        stack: error.stack 
      });
    }
  };

  getPublicProfile = async (req, res, next) => {
    try {
      const targetUserId = req.params.userId;
      const currentUserId = req.user?.id || req.user?._id;
      const profile = await this.profileService.getPublicProfile(targetUserId, currentUserId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfileInfo = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const {name,title} = req.body;
      const result = await this.profileService.updateProfileInfo(userId,{ name, title });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUserSettings = async (req,res,next)=>{
    try {
      const userId = req.user?.id || req.user?._id;
      const settingsData = req.body;
      const result = await this.profileService.updateUserSettings(userId,settingsData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  changePasswordSettings = async(req,res,next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const {oldPassword,newPassword} = req.body;
      const result = await this.profileService.changePasswordSettings(userId,oldPassword,newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  deleteAccount = async (req,res,next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const result = await this.profileService.deleteAccount(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  uploadAvatar = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const fileUrl = req.file?.path;
      const result = await this.profileService.updateAvatar(userId, fileUrl);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  uploadBanner = async (req,res,next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const fileUrl = req.file?.path;
      const result = await this.profileService.updateBanner(userId, fileUrl);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  searchUsers = async (req, res, next) => {
    try {
      const { q } = req.query; 
      
      if (!q) {
        return res.status(200).json({ success: true, data: [] });
      }

      const results = await this.profileService.searchUsers(q);
      
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = ProfileController;