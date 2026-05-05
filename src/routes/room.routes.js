const express = require("express");
const router = express.Router();
const container = require("../config/container");
const roomController = container.resolve("roomController");
const validate = require("../middlewares/validate.middleware");
const { createRoomSchema } = require("../validations/room.validation");
const authMiddleware = require("../middlewares/auth.middleware");
router.use(authMiddleware);

router.post("/",validate(createRoomSchema),roomController.createRoom);
router.get("/:id", roomController.getRoomById);

module.exports = router;
