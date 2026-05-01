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
}

module.exports = PomodoroController;
