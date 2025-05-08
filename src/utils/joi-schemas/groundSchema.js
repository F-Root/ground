import Joi from 'joi';

const addGround = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
  description: Joi.string().required(),
  id: Joi.string().alphanum().required(),
  imgInfo: Joi.alternatives().try(
    // 케이스 1: 빈 객체
    Joi.object().length(0),
    // 케이스 2: imgname과 imgUrl이 모두 있는 객체
    Joi.object({
      imgname: Joi.string().required(),
      imgUrl: Joi.string().required(),
    })
  ),
});

const groundId = Joi.object({
  groundId: Joi.string().alphanum().required(),
}).rename('id', 'groundId');

const groundName = Joi.object({
  ground: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
});

const keyword = Joi.object({ keyword: Joi.string().min(0).required() });

const updateImg = Joi.object({
  id: Joi.string().alphanum().required(),
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
  imgInfo: Joi.object({
    imgname: Joi.string().required(),
    imgUrl: Joi.string().required(),
  }),
});

const updateManager = Joi.object({
  id: Joi.string().alphanum().required(),
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
  //manager: email
  manager: Joi.string().email({ minDomainSegments: 2 }).required(),
});

const updateDescription = Joi.object({
  id: Joi.string().alphanum().required(),
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
  description: Joi.string().required(),
});

const updateTab = Joi.object({
  id: Joi.string().alphanum().required(),
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
  tab: Joi.array()
    .items(Joi.string())
    .min(1)
    .has(Joi.string().valid('전체'))
    .required(),
});

const updateRate = Joi.object({
  id: Joi.string().alphanum().required(),
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
    .required(),
  rate: Joi.number().valid(15, 20, 25, 30, 35, 40, 45, 50),
});

export {
  addGround,
  groundId,
  groundName,
  keyword,
  updateImg,
  updateManager,
  updateDescription,
  updateTab,
  updateRate,
};
