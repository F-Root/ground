import Joi from 'joi';

const groundInfo = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
  description: Joi.string().required(),
  id: Joi.string().alphanum().required(),
});

export { groundInfo };
