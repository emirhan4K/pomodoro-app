const Joi = require('joi');

const createRoomSchema = Joi.object({
    roomName: Joi.string().trim().min(3).max(30).required().messages({
        'string.empty': 'Oda adı boş bırakılamaz.',
        'string.min': 'Oda adı en az 3 karakter olmalıdır.',
        'string.max': 'Oda adı en fazla 30 karakter olabilir.',
        'any.required': 'Oda adı zorunludur.'
    }),
    description: Joi.string().trim().max(200).required().messages({
        'string.empty': 'Oda açıklaması boş bırakılamaz.',
        'string.max': 'Açıklama çok uzun (Maksimum 200 karakter).',
        'any.required': 'Oda açıklaması zorunludur.'
    }),
    isPrivate: Joi.boolean().default(false),
    // Şifre mantığı: Eğer isPrivate 'true' ise şifre zorunlu ve en az 6 karakter olmalı. 'false' ise şifre gönderilemez.
    roomPassword: Joi.string().when('isPrivate', {
        is: true,
        then: Joi.string().min(6).required().messages({
            'string.empty': 'Gizli odalar için şifre boş bırakılamaz.',
            'string.min': 'Şifre en az 6 karakter olmalıdır.',
            'any.required': 'Gizli odalar için şifre belirlemek zorunludur.'
        }),
        otherwise: Joi.forbidden() 
    }),
    capacity: Joi.number().min(2).max(50).default(10).messages({
        'number.min': 'Oda en az 2 kişilik olmalıdır.',
        'number.max': 'Oda en fazla 50 kişilik olabilir.'
    })
});

module.exports = {
    createRoomSchema
};