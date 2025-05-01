import Joi from 'joi';

const signUp = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  id: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9]{5,12}$/))
    .required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\];:'",<>.?/-])[A-Za-z\d!@#$%^&*()_+={}[\];:'",<>.?/-]{8,}$/
      )
    )
    .required(),
  nickname: Joi.string()
    .pattern(new RegExp(/^.{2,10}$/))
    .required(),
});

const signIn = Joi.object({
  // email: Joi.string().email({ minDomainSegments: 2 }).required(),
  id: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9]{5,12}$/))
    .required(),
  password: Joi.string().required(),
});

const authEmail = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  authNumber: Joi.number(),
});

const updateEmail = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
});

export { signUp, signIn, authEmail, updateEmail };
