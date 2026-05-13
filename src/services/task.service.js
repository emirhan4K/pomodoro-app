const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");

class TaskService {
  constructor({ taskRepository, userRepository , profileService}) {
    this.taskRepository = taskRepository;
    this.userRepository = userRepository;
    this.profileService = profileService;
  }
  async createTask(userId, taskData) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException("Kullanıcı bulunamadı!");
    }

    return await this.taskRepository.create({
      userId,
      ...taskData,
    });
  }
  async getUserTasks(userId) { 
    const tasks = await this.taskRepository.find({ userId });
    //Tamamlanmamışlar (false) en üstte, tamamlananlar (true) en altta.
    return tasks.sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    });
  }
  async completeTask(taskId, userId) {
    const task = await this.taskRepository.findOne({ _id: taskId, userId });
    if (!task || task.isCompleted === true) throw new BadRequestException("Görev bulunamadı veya tamamlanmış!");
    const updatedTask = await this.taskRepository.update(taskId, { isCompleted: true });
    const xpAmount = {
      easy:20,
      medium:50,
      hard:100
    }[task.difficulty] ?? 0;
    await this.profileService.gainXp(userId,xpAmount);
    return updatedTask;
  }
  async deleteTask(taskId, userId) {
    const task = await this.taskRepository.findOne({ _id: taskId, userId });
    if (!task) throw new BadRequestException("Görev bulunamadı veya yetkiniz yok!");

    return await this.taskRepository.delete(taskId);
  }
  async updateTask(taskId, userId, updateData) {
    const task = await this.taskRepository.findOne({ _id: taskId, userId });
    if (!task) throw new BadRequestException("Görev bulunamadı veya yetkiniz yok!");
    return await this.taskRepository.update(taskId, {
      title: updateData.title,
      difficulty: updateData.difficulty
    });
  }
}

module.exports = TaskService;
