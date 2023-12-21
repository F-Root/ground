import { Router } from 'express.js';
import { groundService } from '../services/groundService.js';
import { AppError } from '../middlewares.js';

const groundRouter = Router();

groundRouter.get('/ground', async (req, res, next) => {
  const ground = req.query.ground;

  try {
    const selectedGround = await groundService.getGroundInfo(ground);

    res.status(200).json({ selectedGround });
  } catch (error) {
    next(
      new AppError(
        'serverError',
        '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
        500
      )
    );
  }
});

groundRouter.post();

export { groundRouter };
