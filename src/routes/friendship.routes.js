const express = require('express');
const router = express.Router();
const container = require("../config/container");
const friendshipController = container.resolve("friendshipController");
const authMiddleware = require('../middlewares/auth.middleware');
router.use(authMiddleware);

router.post("/request",friendshipController.sendRequest);
router.get("/", friendshipController.getFriends);
router.get("/requests/pending", friendshipController.getPendingRequests);
router.patch("/:id/respond",friendshipController.respondToRequest);



module.exports = router;