const express = require("express");
const router = express.Router();
const container = require("../config/container");
const followController = container.resolve("followController");
const authMiddleware = require("../middlewares/auth.middleware");
router.use(authMiddleware);

router.post("/:targetId/follow", followController.follow);
router.post("/:targetId/unfollow", followController.unfollow);
router.get("/:targetId/followers", followController.getFollowers);
router.get("/:targetId/following", followController.getFollowing);

module.exports = router;
