const express = require('express');
const router = express.Router();
const container = require("../config/container");
const pomodoroController = container.resolve("pomodoroController");
const authMiddleware = require('../middlewares/auth.middleware');
router.use(authMiddleware);

router.post('/', pomodoroController.startSession);
router.patch('/:id/status', pomodoroController.updateStatus);
router.get('/', pomodoroController.getHistory);

module.exports = router;