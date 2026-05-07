const BaseRepository = require("./base.repository");
const Task = require("../models/Task.model");

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }
  
}

module.exports = TaskRepository;