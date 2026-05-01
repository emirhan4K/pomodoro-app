const express = require('express');
const router = express.Router();
const container = require("../config/container");
const profileController = container.resolve("profileController")
const authMiddleware = require('../middlewares/auth.middleware');
router.use(authMiddleware);

router.get("/me", authMiddleware, profileController.getProfile);
router.get("/:userId", profileController.getPublicProfile);

module.exports = router;