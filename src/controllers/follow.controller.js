class FollowController {
  constructor({ followService }) {
    this.followService = followService;
  }

  follow = async (req, res, next) => {
    try {
      // 1. GÜVENLİK: id veya _id hangisi geliyorsa al
      const userId = req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Kullanıcı kimliği (Token) bulunamadı!" });
      }

      const targetId = req.params.targetId;
      const result = await this.followService.follow(userId, targetId);
      
      res.status(200).json({ success: true, message: "Takip edildi", data: result });
    } catch (error) {
      // 2. KÖR NOKTAYI AÇIYORUZ: Render'da kesin gözüksün diye log ekledik
      console.error("🔥 TAKİP ETME (FOLLOW) HATASI:", error.message || error);
      next(error);
    }
  };

  unfollow = async (req, res, next) => {
    try {
      // 1. GÜVENLİK: id veya _id
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Kullanıcı kimliği (Token) bulunamadı!" });
      }

      const targetId = req.params.targetId;
      const result = await this.followService.unfollow(userId, targetId);
      
      res.status(200).json({ success: true, message: "Takipten çıkıldı", data: result });
    } catch (error) {
      console.error("🔥 TAKİPTEN ÇIKMA (UNFOLLOW) HATASI:", error.message || error);
      next(error);
    }
  };

  getFollowers = async (req, res, next) => {
    try {
      const targetId = req.params.targetId; 
      const followers = await this.followService.getFollowers(targetId);
      res.status(200).json({ success: true, data: followers });
    } catch (error) { 
      next(error); 
    }
  };

  getFollowing = async (req, res, next) => {
    try {
      const targetId = req.params.targetId;
      const following = await this.followService.getFollowing(targetId);
      res.status(200).json({ success: true, data: following });
    } catch (error) { 
      next(error); 
    }
  };
}

module.exports = FollowController;