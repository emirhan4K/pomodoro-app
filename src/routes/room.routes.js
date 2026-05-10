const express = require("express");
const router = express.Router();
const container = require("../config/container");
const roomController = container.resolve("roomController");
const validate = require("../middlewares/validate.middleware");
const { uploadAvatar, uploadBanner } = require('../middlewares/upload.middleware');
const { createRoomSchema } = require("../validations/room.validation");
const authMiddleware = require("../middlewares/auth.middleware");
router.use(authMiddleware);
router.get("/", roomController.getAllRooms);
router.post(
    "/", 
    uploadBanner.fields([
        { name: 'avatar', maxCount: 1 }, 
        { name: 'banner', maxCount: 1 }
    ]), 
    validate(createRoomSchema), 
    roomController.createRoom
);
router.get("/:slug", roomController.getRoomBySlug);
router.get("/:roomId/messages", roomController.getRoomMessages);
router.post("/:roomId/join", roomController.joinRoom);
router.post("/:roomId/leave", roomController.leaveRoom);
router.put("/:roomId/avatar", uploadAvatar.single('avatar'), roomController.uploadAvatar);
router.put("/:roomId/banner", uploadBanner.single('banner'), roomController.uploadBanner);
router.delete("/:roomId", roomController.deleteRoom);

module.exports = router;