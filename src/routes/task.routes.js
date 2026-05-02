const express = require('express');
const router = express.Router();
const container = require("../config/container");
const taskController = container.resolve("taskController");
const validate = require('../middlewares/validate.middleware');
const {taskSchema} = require("../validations/task.validations");

const authMiddleware = require('../middlewares/auth.middleware');
router.use(authMiddleware);

router.post("/",validate(taskSchema),taskController.createTask);
router.get("/",taskController.getUserTasks);
router.patch("/:id/complete",taskController.completeTask);
router.delete("/:id",taskController.deleteTask);

module.exports = router;