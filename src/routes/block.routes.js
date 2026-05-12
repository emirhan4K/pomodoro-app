const express = require("express");
const router = express.Router();
const container = require("../config/container");
const blockController = container.resolve("blockController");
const authMiddleware = require("../middlewares/auth.middleware");
router.use(authMiddleware);

router.post("/:targetId/block", blockController.block);
router.post("/:targetId/unblock", blockController.unblock);

module.exports = router;
