const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(15).required().messages({
    'string.empty': 'Kullanıcı adı boş bırakılamaz.',
    'string.min': 'Kullanıcı adı en az 3 karakter olmalıdır.',
    'string.max': 'Kullanıcı adı en fazla 15 karakter olabilir.'
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Lütfen geçerli bir e-posta adresi girin.',
    'string.empty': 'E-posta alanı boş bırakılamaz.'
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Şifreniz en az 6 karakterden oluşmalıdır.',
    'string.empty': 'Şifre alanı boş bırakılamaz.'
  }),

  passwordConfirm: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Şifreler birbiriyle uyuşmuyor.',
    'any.required': 'Şifre tekrarı alanı zorunludur.'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Lütfen geçerli bir e-posta adresi girin.',
    'string.empty': 'E-posta alanı boş bırakılamaz.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Şifre alanı boş bırakılamaz.'
  })
});

module.exports = { registerSchema, loginSchema };