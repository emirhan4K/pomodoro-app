const Joi = require("joi");

const createRoomSchema = Joi.object({
    roomName: Joi.string().min(3).max(30).required().messages({
        "string.empty": "Oda adı boş bırakılamaz",
        "string.min": "Oda adı en az 3 karakter olmalıdır"
    }),
    description: Joi.string().max(200).required().messages({
        "string.empty": "Açıklama boş bırakılamaz"
    }),
    capacity: Joi.number().min(2).max(50).optional(),
    isPrivate: Joi.boolean().default(false),
    roomPassword: Joi.any().when('isPrivate', {
        is: true, // Eğer oda gizliyse
        then: Joi.string().min(4).required().messages({
            "string.empty": "Gizli odalar için şifre girmek zorunludur!",
            "string.min": "Şifre en az 4 karakter olmalıdır!",
            "any.required": "Gizli odalar için şifre zorunludur!"
        }),
        otherwise: Joi.any().strip() 
    })
});

module.exports = {
    createRoomSchema
};