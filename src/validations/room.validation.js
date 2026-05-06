// src/validations/room.validation.js
const Joi = require("joi");

const createRoomSchema = Joi.object({
  roomName: Joi.string().required(),
  description: Joi.string().required(),
  // Frontend'den gelen stringleri sayıya çevirmesine izin ver
  capacity: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  // String olan "false"/"true" değerlerini boolean'a çevir
  isPrivate: Joi.alternatives().try(Joi.boolean(), Joi.string()).default(false),
  roomPassword: Joi.any().optional(),
  
  // Bu iki alanı MUTLAKA ekle, yoksa Multer'ın eklediği alanlar Joi'yi patlatır!
  roomAvatar: Joi.any().optional(),
  roomBanner: Joi.any().optional()
}).unknown(true); // Frontend'den gelen fazladan/bilinmeyen alanları reddetme, yoksay!

module.exports = { createRoomSchema };