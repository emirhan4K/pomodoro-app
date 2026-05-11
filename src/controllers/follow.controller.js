class FollowController {
  constructor({ followService }) {
    this.followService = followService;
  }
  follow = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const targetId = req.params.targetId;
      const result = await this.followService.follow(userId, targetId);
     res.status(200).json({ success: true, message: "Takip edildi", data: result });
    } catch (error) {
      next(error);
    }
  };
  unfollow = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const targetId = req.params.targetId;
      const result = await this.followService.unfollow(userId, targetId);
      res.status(200).json({ success: true, message: "Takipten çıkıldı", data: result });
    } catch (error) {
        next(error)
    }
  };
  getFollowers = async (req, res, next) => {
    try {
      const targetId = req.params.targetId; 
      const followers = await this.followService.getFollowers(targetId);
      res.status(200).json({ success: true, data: followers });
    } catch (error) { next(error); }
  };

  getFollowing = async (req, res, next) => {
    try {
      const targetId = req.params.targetId;
      const following = await this.followService.getFollowing(targetId);
      res.status(200).json({ success: true, data: following });
    } catch (error) { next(error); }
  };
}

module.exports = FollowController;
