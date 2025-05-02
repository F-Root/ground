import { commentModel } from '../db/index.js';
import { AppError } from '../middlewares/index.js';
import { isEmpty } from '../views/public/util.js';
import { userService, contentService, notificateService } from './index.js';

class CommentService {
  constructor(commentModel) {
    this.commentModel = commentModel;
  }

  async addComment(commentInfo) {
    const { comment, email, contentUrl, mention } = commentInfo;
    let { replyIn, replyTo } = commentInfo;
    let replyToAuthor;

    const { _id: author, nickname } =
      await userService.getUserInfoByEmail(email);
    if (!author) {
      throw new AppError(
        'User Not Exist Error',
        '유저가 존재하지 않습니다.',
        500
      );
    }

    const {
      _id: content,
      author: { _id: contentCreator },
    } = await contentService.getContentByContentUrl(contentUrl);
    if (!content) {
      throw new AppError(
        'Content Not Exist Error',
        '컨텐츠가 존재하지 않습니다.',
        500
      );
    }

    if (replyIn) {
      const { _id } = await this.getCommentByUrl(replyIn);
      replyIn = _id;
    }
    if (replyTo) {
      const { _id, author } = await this.getCommentByUrl(replyTo);
      replyTo = _id;
      replyToAuthor = author;
    }

    const newComment = await this.commentModel.create({
      comment,
      author,
      content,
      replyIn,
      replyTo,
      mention,
    });
    if (!newComment) {
      throw new AppError(
        'Comment Created Failed',
        '댓글 작성에 실패하였습니다. 관리자에게 문의해 주세요.',
        500
      );
    }

    // 코멘트 알림 생성
    if (!replyIn && !author.equals(contentCreator)) {
      //컨텐츠 작성자와 댓글 작성자가 다른 경우에만 댓글 알림 생성
      await notificateService.addNotification({
        type: 'comment',
        post: newComment,
        creator: { id: author, nickname },
      });
    }
    if (replyIn && !author.equals(replyToAuthor)) {
      //replyIn이 있고, 답글 수신자와 송신자가 다른 경우에만 답글 알림 생성
      await notificateService.addNotification({
        type: 'reply',
        post: newComment,
        creator: { id: author, nickname },
      });
    }

    return newComment;
  }

  async getCommentsByContentsUrl(contentsUrl) {
    const commentsCount =
      await this.commentModel.findCommentsByContentsUrl(contentsUrl);
    return commentsCount.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});
  }

  async getSequenceOfNewComment(id) {
    const commentPosition = await this.commentModel.findCommentPosition(id);
    if (!commentPosition) {
      throw new AppError(
        'Sequence Data Not Exist Error',
        '집계 데이터가 존재하지 않습니다.',
        500
      );
    }
    return commentPosition;
  }

  async getSequenceOfComment(id) {
    const commentPosition = await this.commentModel.findCommentPosition(id);
    if (!commentPosition) {
      throw new AppError(
        'Sequence Data Not Exist Error',
        '집계 데이터가 존재하지 않습니다.',
        500
      );
    }
    return commentPosition;
  }

  async getCommentByUrl(url) {
    const comment = await this.commentModel.findByUrl(url);
    if (!comment) {
      throw new AppError(
        'Comment Not Exist Error',
        '댓글이 존재하지 않습니다.',
        500
      );
    }
    return comment;
  }

  async getNumberOfComments(contentUrl) {
    const { _id: content } =
      await contentService.getContentByContentUrl(contentUrl);
    if (!content) {
      throw new AppError(
        'Content Not Exist Error',
        '컨텐츠가 존재하지 않습니다.',
        500
      );
    }
    return await this.commentModel.getCommentCountByContent(content);
  }

  async getPaginationCommentsAndReplies({ contentUrl, cp = '', commentCount }) {
    const { _id: content } =
      await contentService.getContentByContentUrl(contentUrl);
    if (!content) {
      throw new AppError(
        'Content Not Exist Error',
        '컨텐츠가 존재하지 않습니다.',
        500
      );
    }

    const pagingComments = await this.commentModel.getPagingComments(
      content,
      cp,
      commentCount
    );
    const commentsId = pagingComments.comments.map((comment) => comment._id);
    //답글(대댓글) 구하기
    const pagingReplies = await this.getAllReplies(commentsId);
    const numberOfPagingReplies = await this.getNumberOfReplies(commentsId);

    return { ...pagingComments, pagingReplies, numberOfPagingReplies };
  }

  async getAllReplies(commentsId) {
    return await this.commentModel.findAllReplies(commentsId);
  }

  async getNextReplies(commentId, replyId, restReplies) {
    const nextReplies = await this.commentModel.findNextReplies(
      commentId,
      replyId,
      restReplies
    );
    const lastReply = nextReplies[nextReplies.length - 1];
    const checkCreatedLately = await this.checkCreated({
      commentId,
      replyId: lastReply?._id,
      period: 'lately',
    });
    return { replies: nextReplies, checkCreated: checkCreatedLately };
  }

  async getPrevReplies(commentId, replyId, include = '', restReplies) {
    let prevReplies;
    if (isEmpty(include)) {
      prevReplies = await this.commentModel.findPrevReplies(
        commentId,
        replyId,
        false,
        restReplies
      );
    } else {
      prevReplies = await this.commentModel.findPrevReplies(
        commentId,
        replyId,
        true,
        restReplies
      );
    }
    const firstReply = prevReplies[0];
    const checkCreatedEarly = await this.checkCreated({
      commentId,
      replyId: firstReply?._id,
      period: 'early',
    });
    return { replies: prevReplies, checkCreated: checkCreatedEarly };
  }

  async checkCreated({ commentId, replyId, period }) {
    return await this.commentModel.findCreated(commentId, replyId, period);
  }

  async getNumberOfReplies(commentsId) {
    return await this.commentModel.findReplyCountByComment(commentsId);
  }

  async getNotificationRecipient({ post }) {
    const { replyTo } = post;
    return await this.commentModel.findCommentRecipient(replyTo);
  }
}

const commentService = new CommentService(commentModel);

export { commentService };
