
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

  forgotPassword = async (req,res,next) => {
    console.log("Gelen Body:", req.body)
    try {
      const {email} = req.body;
      const result = await this.authService.forgotPassword(email);
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { email, code, newPassword } = req.body;
      const result = await this.authService.resetPassword({ email, code, newPassword });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }


}

module.exports = AuthController;