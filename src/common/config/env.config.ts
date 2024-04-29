import Joi from 'joi';

const dbSchema = {
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNC: Joi.boolean().required(),
};

const jwtSchema = {
  JWT_SECRET_KEY: Joi.string().required(),
};

const redisSchema = {
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  // REDIS_PASSWORD: Joi.string().required(),
};

const awsSchema = {
  AWS_REGION: Joi.string().required(),
  AWS_S3_ACCESS_KEY_ID: Joi.string().required(),
  AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),
};

export const validationSchema = Joi.object({
  ...dbSchema,
  ...jwtSchema,
  ...redisSchema,
  ...awsSchema,
});
