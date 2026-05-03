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
    return { user, task };
  }
  async getUserTasks(userId) { //Sadece o kullanıcıya ait olan tüm görevleri getirir.
    return await this.taskRepository.find({ userId });
  }
  async completeTask(taskId, userId) {
    const task = await this.taskRepository.findOne({ _id: taskId, userId });
    if (!task) throw new BadRequestException("Görev bulunamadı veya yetkiniz yok!");

    const updatedTask = await this.taskRepository.update(taskId, { isCompleted: true });
    await this.profileService.gainXp(userId, 50); //50 xp ekle 
    return updatedTask;
  }
  async deleteTask(taskId, userId) {
    const task = await this.taskRepository.findOne({ _id: taskId, userId });
    if (!task) throw new BadRequestException("Görev bulunamadı veya yetkiniz yok!");

    return await this.taskRepository.delete(taskId);
  }
}

module.exports = TaskService;
