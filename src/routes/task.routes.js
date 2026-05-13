const express = require('express');
const router = express.Router();
const container = require("../config/container");
const taskController = container.resolve("taskController");
const validate = require('../middlewares/validate.middleware');
const {taskSchema} = require("../validations/task.validations");

const authMiddleware = require('../middlewares/auth.middleware');
router.use(authMiddleware);

router.get("/",taskController.getUserTasks);
router.post("/",validate(taskSchema),taskController.createTask);
router.put("/:id", validate(taskSchema), taskController.updateTask)
router.delete("/:id",taskController.deleteTask);
router.patch("/:id/complete",taskController.completeTask);  


module.exports = router;