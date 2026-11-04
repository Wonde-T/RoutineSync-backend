import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  CORS_ORIGIN: Joi.string().default('*'),
  DATABASE_URL: Joi.string().uri().optional(),
  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().port().optional(),
  DB_USERNAME: Joi.string().optional(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_NAME: Joi.string().optional(),
  DB_SSL: Joi.boolean().optional(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('30d'),
});
