import Joi from 'joi';

const signUp = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\];:'",<>.?/-])[A-Za-z\d!@#$%^&*()_+={}[\];:'",<>.?/-]{8,}$/
      )
    )
    .required(),
  nickname: Joi.string().required(),
});

const signIn = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});

export { signUp, signIn };
