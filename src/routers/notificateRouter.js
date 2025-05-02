import { Router } from 'express';
import { notificateService } from '../services/index.js';
import { tokenCheck, AppError } from '../middlewares/index.js';

const notificateRouter = Router();

notificateRouter.put('/update', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  try {
    await notificateService.updateAllRead({ email });
    res.status(200).json({ readAllNotification: 'succeed' });
  } catch (error) {
    next(
      new AppError(
        'ServerError',
        '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
        500
      )
    );
  }
});

notificateRouter.patch('/content', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  const { url } = req.query;
  try {
    if (url) {
      // isRead Update
      await notificateService.updateContentRead({
        email,
        url,
      });
    }
    res.status(200).json({ readContent: 'succeed' });
  } catch (error) {
    next(
      new AppError(
        'ServerError',
        '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
        500
      )
    );
  }
});

notificateRouter.patch('/comment', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  const { comment, reply } = req.query;
  const url = comment ? comment.split('c_')[1] : reply.split('c_')[1];
  try {
    // isRead update
    await notificateService.updateCommentRead({
      email,
      url,
    });
    res.status(200).json({ readComment: 'succeed' });
  } catch (error) {
    next(
      new AppError(
        'ServerError',
        '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
        500
      )
    );
  }
});

export { notificateRouter };
