import { model } from 'mongoose';
import { CommentSchema } from '../schemas/commentSchema.js';

const Comment = model('comments', CommentSchema);

class CommentModel {
  async create(commentInfo) {
    return await Comment.create(commentInfo);
    // let newComment = new Comment(commentInfo);
    // await newComment.save();
    // return await newComment.populate([
    //   { path: 'content', select: { _id: 0, url: 1 } },
    //   { path: 'author', select: { _id: 0, email: 1, imgUrl: 1, nickname: 1 } },
    // ]);
  }
  async findByUrl(url) {
    return await Comment.findOne({ url }).populate('replyIn');
  }
  async findCommentsByContentsUrl(contentsUrl) {
    return await Comment.aggregate([
      {
        $lookup: {
          from: 'contents',
          localField: 'content',
          foreignField: '_id',
          as: 'contents',
        },
      },
      { $unwind: '$contents' },
      { $match: { 'contents.url': { $in: contentsUrl } } },
      { $group: { _id: '$contents.url', count: { $sum: 1 } } },
    ]);
  }
  async findCommentPosition(commentId) {
    return await Comment.aggregate([
      { $match: { replyIn: { $exists: false } } },
      {
        $setWindowFields: {
          sortBy: { createdAt: 1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      { $match: { _id: commentId } },
      {
        $project: {
          _id: 1,
          url: 1,
          rank: 1,
        },
      },
    ]);
  }
  async getCommentCountByContent(content) {
    // return await Comment.find(
    // { replyIn: { $exists: false } },
    // { content }
    // ).count();
    return await Comment.countDocuments({
      content,
      replyIn: { $exists: false },
    });
  }
  async getCommentByCommentsID(commentsId) {
    return await Comment.find({ commentsId });
  }
  /*comments pagination
   * content: 댓글을 구할 컨텐츠
   * cp: 컨텐츠의 comment page(1~50: cp=1 / 51~100: cp=2)
   * commentCount: 댓글 갯수
   */
  async getPagingComments(content, cp, commentCount) {
    const commentsPerPage = 50;
    const totalPages = Math.ceil(commentCount / commentsPerPage) || 1;
    // cp값이 없는 경우
    if (!cp || commentCount <= commentsPerPage) {
      cp = totalPages;
    }
    const comments = await Comment.aggregate([
      { $match: { content, replyIn: { $exists: false } } },
      { $skip: (cp - 1) * commentsPerPage },
      { $limit: commentsPerPage },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo',
        },
      },
      // { $set: { replyCheck: { reply: '', period: 'lately' } } },
    ]);

    return { comments, commentPage: cp };
    // return await Comment.find({ content }, { _id: 0 }).populate([
    //   { path: 'content', select: { _id: 0, url: 1 } },
    //   {
    //     path: 'author',
    //     select: { _id: 0, email: 1, imgUrl: 1, nickname: 1 },
    //   },
    // ]);
  }

  async findAllReplies(comments) {
    return comments.reduce(async (results, comment) => {
      const previousResults = await results;
      const result = await Comment.find({ replyIn: comment })
        .populate([
          {
            path: 'author',
            select: { _id: 0, email: 1, imgUrl: 1, nickname: 1 },
          },
          { path: 'content', select: { _id: 0, url: 1 } },
        ])
        .limit(5);
      return previousResults.concat(result);
    }, Promise.resolve([]));
  }

  async findNextReplies(commentId, replyId, limit = 5) {
    // return await Comment.find({ replyIn: comments }, null, {
    //   skip: count,
    // })
    //   .populate([
    //     {
    //       path: 'author',
    //       select: { _id: 0, email: 1, imgUrl: 1, nickname: 1 },
    //     },
    //     { path: 'content', select: { _id: 0, url: 1 } },
    //   ])
    //   .limit(5);
    return await Comment.aggregate([
      { $match: { replyIn: commentId } },
      { $match: { _id: { $gt: replyId } } },
      { $sort: { createdAt: 1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
    ]);
  }

  async findPrevReplies(commentId, replyId, includeCurrent = false, limit = 5) {
    const comparisonOperator = includeCurrent ? '$lte' : '$lt';
    return await Comment.aggregate([
      { $match: { replyIn: commentId } },
      { $match: { _id: { [comparisonOperator]: replyId } } },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
    ]);
  }

  async findCreated(commentId, replyId, period) {
    if (period === 'early') {
      const reply = await Comment.findOne(
        {
          _id: { $lt: replyId },
          replyIn: commentId,
        },
        { _id: 0, comment: 1, url: 1 }
      );
      return { reply, period };
    }
    if (period === 'lately') {
      const reply = await Comment.findOne(
        {
          _id: { $gt: replyId },
          replyIn: commentId,
        },
        { _id: 0, comment: 1, url: 1 }
      );
      return { reply, period };
    }
  }

  async findReplyCountByComment(comments) {
    // return await Comment.find({ replyIn: { $in: comments } }).count();
    // return await Comment.countDocuments({ replyIn: { $in: comments } });

    // const results = await Comment.aggregate([
    //   { $match: { replyIn: { $in: comments } } },
    //   { $group: { _id: '$replyIn', count: { $sum: 1 } } },
    // ]);
    // return comments.map((comment) => {
    //   const result = results.find((r) => {
    //     return r._id === comment;
    //   });
    //   return { comment, count: result ? result.count : 0 };
    // });

    const results = await Comment.aggregate([
      { $match: { replyIn: { $in: comments } } },
      { $group: { _id: '$replyIn', count: { $sum: 1 } } },
    ]);

    return results.reduce((acc, result) => {
      acc[result._id] = result.count;
      return acc;
    }, {});
  }

  async findCommentRecipient(replyTo) {
    return await Comment.aggregate([
      { $match: { _id: replyTo } },
      {
        $lookup: {
          from: 'users',
          let: { authorId: '$author' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$authorId'] },
                    { $eq: ['$notifications.reply', true] },
                  ],
                },
              },
            },
          ],
          as: 'authorInfo',
        },
      },
      //authorInfo가 빈 배열이 아닌 경우. $ne : not equal
      { $match: { authorInfo: { $ne: [] } } },
    ]);
  }
}

const commentModel = new CommentModel();

export { commentModel };
