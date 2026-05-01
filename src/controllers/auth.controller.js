class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }
  register = async (req, res, next) => {
    try {
      const { user, token } = await this.authService.register(req.body);
      
      res.status(201).json({
        success: true,
        user, 
        token  
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { user, token } = await this.authService.login(req.body);
      res.status(200).json({
        success: true,
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthController;