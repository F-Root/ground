import Joi from 'joi';

const addContent = Joi.object({
  category: Joi.string().required(),
  title: Joi.string().min(5).required(),
  content: Joi.object({
    ops: Joi.array()
      .items(Joi.object({ insert: Joi.string() }))
      .min(1),
  }).required(),
  groundId: Joi.string().alphanum().required(),
});

const grounds = Joi.object({
  grounds: Joi.alternatives()
    .try(
      // 케이스 1: 빈 배열
      Joi.array().length(0),
      // 케이스 2: 객체들이 포함된 배열
      Joi.array().items(
        Joi.object({
          name: Joi.string()
            .pattern(/^[a-zA-Z0-9가-힣\s/]+$/i)
            .required(),
          img: Joi.alternatives()
            .try(
              // 케이스 1: 빈 객체
              Joi.object().length(0),
              // 케이스 2: imgUrl만 있는 객체
              Joi.object({
                imgUrl: Joi.string().required(),
              })
            )
            .required(),
          id: Joi.string().alphanum().required(),
        })
      )
    )
    .required(),
});

const contentUrl = Joi.object({
  url: Joi.string()
    .pattern(/^\d{10}$/)
    .required(),
});

const numberOfContents = Joi.object({
  category: Joi.string(),
});

const paginationContents = Joi.object({
  category: Joi.string(),
  page: Joi.number(),
});

export {
  addContent,
  grounds,
  contentUrl,
  numberOfContents,
  paginationContents,
};
