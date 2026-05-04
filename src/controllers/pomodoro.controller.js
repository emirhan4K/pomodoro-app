class PomodoroController {
  constructor({ pomodoroService }) {
    this.pomodoroService = pomodoroService;
  }
  startSession = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const session = req.body;
      const result = await this.pomodoroService.createSession(userId, session);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
  updateStatus = async (req, res, next) => {
    try {
      const sessionId = req.params.id;
      const userId = req.user.id;
      const { status } = req.body;
      const result = await this.pomodoroService.updateSessionStatus(
        sessionId,
        userId,
        status,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  getHistory = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const result = await this.pomodoroService.getUserHistory(
        userId,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  getDailyStats = async (req, res, next) =>{
    try {
      const userId = req.user.id || req.user._id;
      const offset = req.query.offset || 0;
      const stats = await this.pomodoroService.getDailyDashboardStats(userId,offset);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
  getWeeklyDashboardStats = async (req,res,next)=>{
    try {
      const userId = req.user.id || req.user._id;
      const offset = req.query.offset || 0;
      const stats = await this.pomodoroService.getDailyDashboardStats(userId,offset);
      res.status(200).json(stats)
    } catch (error) {
      next(error);
    }
  }
  getMonthlyDashboardStats = async (req,res,next)=>{
    try {
      const userId = req.user.id || req.user._id;
      const offset = req.query.offset || 0;
      const stats = await this.pomodoroService.getDailyDashboardStats(userId,offset);
      res.status(200).json(stats)
    } catch (error) {
      next(error);
    }
  }
  getAllTimeDashboardStats = async (req,res,next)=>{
    try {
      const userId = req.user.id || req.user._id;
      const stats = await this.pomodoroService.getAllTimeDashboardStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PomodoroController;
