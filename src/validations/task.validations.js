const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Başlık alanı boş bırakılamaz.",
    "string.min": "Başlık en az 3 karakter olmalıdır.",
    "string.max": "Başlık adı en fazla 50 karakter olabilir.",
  }),
});

module.exports = { taskSchema };
