import Joi from 'joi';

const addComment = Joi.object({
  comment: Joi.string().required(),
  url: Joi.string()
    .pattern(/^\d{10}$/)
    .required(),
  replyIn: Joi.string().alphanum().length(12),
  replyTo: Joi.string().alphanum().length(12),
  mention: Joi.string().pattern(new RegExp(/^.{2,10}$/)),
});

const contentsUrl = Joi.object({
  contents: Joi.array()
    .items(Joi.string().pattern(/^\d{10}$/))
    .unique()
    .required(),
});

const commentPage = Joi.object({
  cp: Joi.number(),
});

const replyParams = Joi.object({
  order: Joi.string().valid('prev', 'next'),
  include: Joi.string().valid('include'),
});

const commentAndReply = Joi.object({
  comment: Joi.string().alphanum().length(12),
  reply: Joi.string().alphanum().length(12),
});

const notifiedReply = Joi.object({
  reply: Joi.string()
    .pattern(/^c_[a-zA-Z0-9]{12}$/)
    .required(),
});

const replySequence = Joi.object({
  comment: Joi.string().pattern(/^c_[a-zA-Z0-9]{12}$/),
  reply: Joi.string().pattern(/^c_[a-zA-Z0-9]{12}$/),
}).xor('comment', 'reply');

export {
  addComment,
  contentsUrl,
  commentPage,
  replyParams,
  commentAndReply,
  notifiedReply,
  replySequence,
};
