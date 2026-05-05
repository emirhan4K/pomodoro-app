const express = require('express');
const router = express.Router();
const container = require("../config/container");
const profileController = container.resolve("profileController")
const authMiddleware = require('../middlewares/auth.middleware');
router.use(authMiddleware);

router.get("/me",  profileController.getProfile);
router.get("/:userId", profileController.getPublicProfile);
router.put("/update-info",profileController.updateProfileInfo);
router.put("/settings",profileController.updateUserSettings);
router.put("/password",profileController.changePasswordSettings);
router.delete("/account",profileController.deleteAccount);

module.exports = router;