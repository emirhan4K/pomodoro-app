class BlockController {
  constructor({ blockService }) {
    this.blockService = blockService;
  }
  block = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const targetId = req.params.targetId;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Token bulunamadı!" });
      }
      await this.blockService.blockUser(userId, targetId);
      res
        .status(200)
        .json({ success: true, message: "Kullanıcı başarıyla engellendi." });
    } catch (error) {
      console.error("🔥 ENGELLEME HATASI:", error.message || error);
      next(error);
    }
  };
  unblock = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const targetId = req.params.targetId;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Token bulunamadı!" });
      }

      await this.blockService.unblockUser(userId, targetId);
      res
        .status(200)
        .json({ success: true, message: "Kullanıcının engeli kaldırıldı." });
    } catch (error) {
      console.error("🔥 ENGEL KALDIRMA HATASI:", error.message || error);
      next(error);
    }
  };
  getBlockedList = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const result = await this.blockService.getBlockedUsers(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BlockController;
