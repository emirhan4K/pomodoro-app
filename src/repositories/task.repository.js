const BaseRepository = require("./base.repository");
const Task = require("../models/task.model");

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }
  
}

module.exports = TaskRepository;