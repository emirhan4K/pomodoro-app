class TaskController {
  constructor({ taskService }) {
    this.taskService = taskService;
  }

 createTask = async (req, res, next) => {
    try {
      const result = await this.taskService.createTask(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
  getUserTasks = async (req, res, next) => {
    try {
      const result = await this.taskService.getUserTasks(req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
  completeTask = async (req, res, next) => {
    try {
      const result = await this.taskService.completeTask(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
  deleteTask = async (req, res, next) => {
    try {
      await this.taskService.deleteTask(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: "Görev başarıyla silindi." });
    } catch (error) {
      next(error);
    }
  };
  updateTask = async (req, res, next) => {
    try {
      const result = await this.taskService.updateTask(req.params.id, req.user.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = TaskController;