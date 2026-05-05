const Joi = require('joi');

const updateInfoSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Görünen ad boş bırakılamaz',
    'any.required': 'Görünen ad zorunludur'
  }),
  title: Joi.string().max(100).allow('', null) 
});

const updateSettingsSchema = Joi.object({
  focusTime: Joi.number().min(15).max(60).required(),
  shortBreak: Joi.number().min(3).max(15).required(),
  longBreak: Joi.number().min(10).max(30).required(),
  soundEnabled: Joi.boolean().required(),
  notificationsEnabled: Joi.boolean().required(),
  tickSoundEnabled: Joi.boolean().required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({'string.empty': 'Mevcut şifrenizi girmelisiniz.'}),
  newPassword: Joi.string().min(6).required().messages({'string.min': 'Yeni şifre en az 6 karakter olmalıdır.'})
});

module.exports = { updateInfoSchema, updateSettingsSchema, changePasswordSchema };