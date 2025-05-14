import { Router } from 'express';
import { commentService } from '../services/index.js';
import {
  validateRequestWith,
  tokenCheck,
  AppError,
} from '../middlewares/index.js';
import * as JoiSchema from '../utils/joi-schemas/index.js';

const commentRouter = new Router();

commentRouter.post(
  '/create',
  tokenCheck,
  validateRequestWith(JoiSchema.addComment, 'body'),
  async (req, res, next) => {
    const { comment, url: contentUrl, replyIn, replyTo, mention } = req.body;
    const email = req.currentUser;
    // let newComment = '';
    try {
      // for (let i = 0; i < 18; i++) {
      //   newComment = await commentService.addComment({
      //     comment: comment + i,
      //     email,
      //     contentUrl,
      //     replyIn,
      //     replyTo,
      //     mention,
      //   });
      // }
      const newComment = await commentService.addComment({
        comment,
        email,
        contentUrl,
        replyIn,
        replyTo,
        mention,
      });
      const commentInfo = {};

      if (newComment.replyIn) {
        const [position] = await commentService.getSequenceOfNewComment(
          newComment.replyIn._id
        );
        commentInfo.position = position;
        commentInfo.type = 'reply';
        commentInfo.url = newComment.url;
      } else {
        const [position] = await commentService.getSequenceOfNewComment(
          newComment._id
        );
        commentInfo.position = position;
        commentInfo.type = 'comment';
        commentInfo.url = newComment.url;
      }

      // comment focus처리를 위한 cookie
      res.cookie('newComment', JSON.stringify(newComment.url), {
        expires: new Date(Date.now() + 1000 * 5), // 5 seconds
      });
      res.status(201).json(commentInfo);
    } catch (error) {
      next(
        new AppError(
          'serverError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

// get comment count by content url in main view
commentRouter.get(
  '',
  validateRequestWith(JoiSchema.contentsUrl, 'query'),
  async (req, res, next) => {
    const { contents } = req.query;
    try {
      const comments = await commentService.getCommentsByContentsUrl(contents);
      res.status(200).json(comments);
    } catch (error) {
      next(
        new AppError(
          'serverError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

commentRouter.get(
  '/content/:url',
  validateRequestWith(JoiSchema.contentUrl, 'params'),
  validateRequestWith(JoiSchema.commentPage, 'query'),
  async (req, res, next) => {
    const contentUrl = req.params.url;
    // cp : 댓글 페이지(코멘트가 있는 페이지)
    const { cp } = req.query;
    try {
      // 해당 컨텐츠의 댓글 갯수 가져오기
      const commentCount = await commentService.getNumberOfComments(contentUrl);
      // 댓글과 답글 가져오기.
      const { comments, commentPage, pagingReplies, numberOfPagingReplies } =
        await commentService.getPaginationCommentsAndReplies({
          contentUrl,
          cp,
          commentCount,
        });
      res.status(200).json({
        comments,
        commentPage,
        commentCount,
        pagingReplies,
        numberOfPagingReplies,
      });
    } catch (error) {
      next(
        new AppError(
          'serverError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

/* 답글 찾기
 * order: 이전 답글 / 다음 답글 (답글 시간 기준)
 * include: 유저가 방금 작성한 답글 유무
 * comment: 코멘트(댓글)
 * reply: 답글(대댓글)
 */
commentRouter.get(
  '/replies/:order/:include?',
  validateRequestWith(JoiSchema.replyParams, 'params'),
  validateRequestWith(JoiSchema.commentAndReply, 'query'),
  async (req, res, next) => {
    const { order, include } = req.params;
    const { comment, reply } = req.query;
    try {
      const { _id: commentId } = await commentService.getCommentByUrl(comment);
      const { _id: replyId } = await commentService.getCommentByUrl(reply);
      const { replies, checkCreated } =
        order === 'next'
          ? await commentService.getNextReplies(commentId, replyId)
          : await commentService.getPrevReplies(commentId, replyId, include);
      const replyCheck = { [checkCreated.period]: checkCreated.reply };
      const numberOfPagingReplies = await commentService.getNumberOfReplies([
        commentId,
      ]);
      res.status(200).json({
        replies,
        comment: { _id: commentId, url: comment, replyCheck },
        numberOfPagingReplies,
      });
    } catch (error) {
      next(
        new AppError(
          'serverError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

// 답글 위치 정보 찾기
commentRouter.get(
  '/position',
  validateRequestWith(JoiSchema.notifiedReply, 'query'),
  async (req, res, next) => {
    const { reply } = req.query;
    const url = reply.split('c_')[1];
    const replyCheck = {};
    try {
      // get comment id by url
      const {
        _id: replyId,
        replyIn: { _id: commentId, url: commentUrl } = {},
      } = await commentService.getCommentByUrl(url);
      // 쿼리로 전달된 reply을 포함한 5개의 대댓글 구하기 (이전 댓글들로)
      // 그에 더불어 이전 대댓글이 더 존재하는지 확인
      const {
        replies,
        checkCreated: { reply, period }, // 이전 답글
      } = await commentService.getPrevReplies(commentId, replyId, 'include');
      replyCheck[period] = reply;

      // reply 이후 답글이 더 존재하는지 확인
      if (replies.length < 5) {
        // reply를 포함해서 나온 답글들이 총 5개보다 적을 경우
        const restReplies = 5 - replies.length; // 출력되어야 할 남은 대댓글 갯수
        const {
          replies: moreReplies,
          checkCreated: { reply, period }, // 다음 답글
        } = await commentService.getNextReplies(
          commentId,
          replyId,
          restReplies
        );
        replyCheck[period] = reply;
        // 답글 목록 합치기
        replies.push(...moreReplies);
      } else {
        const { reply, period } = await commentService.checkCreated({
          commentId,
          replyId,
          period: 'lately',
        });
        replyCheck[period] = reply;
      }

      // comment(댓글)의 답글 갯수 확인
      const numberOfPagingReplies = await commentService.getNumberOfReplies([
        commentId,
      ]);

      res.status(200).json({
        replies,
        comment: { _id: commentId, url: commentUrl, replyCheck },
        numberOfPagingReplies,
      });
    } catch (error) {
      next(
        new AppError(
          'serverError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

// comment or reply notificate link를 작성하기 위한 sequence 가져오기
commentRouter.get(
  '/sequence',
  validateRequestWith(JoiSchema.replySequence, 'query'),
  async (req, res, next) => {
    const { comment, reply } = req.query;
    const url = comment ? comment.split('c_')[1] : reply.split('c_')[1];
    const type = comment ? 'comment' : 'reply';
    const commentInfo = {};
    try {
      // get comment id by url
      const { _id: commentId, replyIn: { _id: replyId } = {} } =
        await commentService.getCommentByUrl(url);
      // find comment position
      if (type === 'comment') {
        const [position] = await commentService.getSequenceOfComment(commentId);
        commentInfo.position = position;
        // commentInfo.type = type;
        commentInfo.url = url;
      } else {
        const [position] = await commentService.getSequenceOfComment(replyId);
        commentInfo.position = position;
        // commentInfo.type = type;
        commentInfo.url = url;
      }

      res.cookie(`noti-c_${url}`, JSON.stringify(url), {
        expires: new Date(Date.now() + 1000 * 5), // 5 seconds
      });
      res.status(200).json(commentInfo);
    } catch (error) {
      next(
        new AppError(
          'serverError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

export { commentRouter };
