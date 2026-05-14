const express = require("express");
const router = express.Router();
const container = require("../config/container");
const notificationController = container.resolve("notificationController");
const authMiddleware = require("../middlewares/auth.middleware");
router.use(authMiddleware);

router.get("/",notificationController.getUserNotifications);
router.patch("/:id/read",notificationController.markAsRead);

module.exports = router;