const joi = require("joi");

const schema = {
  registerSchema: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(12).required(),
    isAdmin: joi.boolean().default(false),
  }),
  loginSchema: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).max(12).required(),
  }),
};

module.exports = schema;
