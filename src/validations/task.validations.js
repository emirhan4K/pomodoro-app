const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Başlık alanı boş bırakılamaz.",
    "string.min": "Başlık en az 3 karakter olmalıdır.",
    "string.max": "Başlık adı en fazla 50 karakter olabilir.",
  }),
  difficulty: Joi.string().valid("easy", "medium", "hard").optional().messages({
    "any.only": "Zorluk derecesi sadece 'easy', 'medium' veya 'hard' olabilir."
  })
});

module.exports = { taskSchema };
