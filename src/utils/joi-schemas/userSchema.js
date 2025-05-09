import Joi from 'joi';

const signIn = Joi.object({
  id: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9]{5,12}$/))
    .required(),
  password: Joi.string().required(),
});

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

const authEmail = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  authNumber: Joi.number().required(),
});

const signUpAvailable = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }),
  id: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9]{5,12}$/)),
}).xor('email', 'id');

const updateEmail = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
});

const updatePassword = Joi.object({
  'password-now': Joi.string().required(),
  'password-new': Joi.string()
    .pattern(
      new RegExp(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\];:'",<>.?/-])[A-Za-z\d!@#$%^&*()_+={}[\];:'",<>.?/-]{8,}$/
      )
    )
    .required(),
  'password-check': Joi.string()
    .pattern(
      new RegExp(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\];:'",<>.?/-])[A-Za-z\d!@#$%^&*()_+={}[\];:'",<>.?/-]{8,}$/
      )
    )
    .required(),
});

const updateSubscribeList = Joi.array()
  .items(Joi.string().alphanum())
  .min(0)
  .required();

const updateProfile = Joi.object({
  imgInfo: Joi.alternatives().try(
    // 케이스 1: 빈 객체
    Joi.object().length(0),
    // 케이스 2: imgname과 imgUrl이 모두 있는 객체
    Joi.object({
      imgname: Joi.string().required(),
      imgUrl: Joi.string().required(),
    })
  ),
  nickname: Joi.string()
    .pattern(new RegExp(/^.{2,10}$/))
    .required(),
});

const clickForNotificate = Joi.object({
  clickForNotificate: Joi.boolean().required(),
});

const clickForSubscribe = Joi.object({
  clickForSubscribe: Joi.boolean().required(),
});

const updateCommentNotificate = Joi.object({
  comment: Joi.string().valid('on', 'off').required(),
  reply: Joi.string().valid('on', 'off').required(),
});

const updateNotification = Joi.object().pattern(
  /^[a-zA-Z0-9]+$/, // 키는 영문자와 숫자만 허용
  Joi.alternatives().try(
    // 케이스 1: canceled만 있는 경우
    Joi.object({
      canceled: Joi.boolean().valid(true).required(),
      sort: Joi.forbidden(),
      tab: Joi.forbidden(),
    }),
    // 케이스 2: sort와 tab이 있는 경우
    Joi.object({
      canceled: Joi.forbidden(),
      sort: Joi.alternatives()
        .try(
          Joi.array().items(Joi.string().valid('best')).length(1), // ['best']
          Joi.array().items(Joi.string().valid('all')).length(1), // ['all']
          Joi.array() // ['best', 'all'] 또는 ['all', 'best']
            .items(Joi.string().valid('best', 'all'))
            .min(2)
            .max(2)
            .unique()
        )
        .required(),
      tab: Joi.array().items(Joi.string()).min(0).required(),
    })
  )
);

export {
  signIn,
  signUp,
  authEmail,
  signUpAvailable,
  updateEmail,
  updatePassword,
  updateSubscribeList,
  updateProfile,
  clickForNotificate,
  clickForSubscribe,
  updateCommentNotificate,
  updateNotification,
};
