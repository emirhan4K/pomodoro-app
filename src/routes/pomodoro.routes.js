const express = require("express");
const router = express.Router();
const container = require("../config/container");
const pomodoroController = container.resolve("pomodoroController");
const authMiddleware = require("../middlewares/auth.middleware");
router.use(authMiddleware);

router.get("/daily-stats", pomodoroController.getDailyStats);
router.get("/weekly-stats", pomodoroController.getWeeklyDashboardStats);
router.post("/", pomodoroController.startSession);
router.patch("/:id/status", pomodoroController.updateStatus);
router.get("/", pomodoroController.getHistory);

module.exports = router;
