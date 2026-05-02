const express = require('express');
const router = express.Router();
const container = require('../config/container'); 
const authController = container.resolve('authController');
const validate = require('../middlewares/validate.middleware');
const { registerSchema } = require('../validations/auth.validations');
const { loginSchema } = require("../validations/auth.validations");

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',validate(loginSchema), authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;