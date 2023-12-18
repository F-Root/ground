import { Router } from 'express';
import { userService } from '../services/index.js';
import { signInCheck, validateRequestWith } from '../middlewares/index.js';
import * as JoiSchema from '../utils/joi-schemas/index.js';
import { AppError } from '../middlewares/index.js';

const userRouter = Router();
const cookieName = process.env.COOKIE_NAME;

userRouter.post(
  '/signIn',
  validateRequestWith(JoiSchema.signIn, 'body'),
  async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const accessToken = await userService.getUserToken({ email, password });

      res.cookie(cookieName, accessToken, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //24시간
        httpOnly: true,
        signed: true,
      });

      res.status(200).json({ signIn: 'succeed' });
    } catch (error) {
      if (
        error.name.includes('emailError') ||
        error.name.includes('passwdError')
      ) {
        next(
          new AppError('userInfoError', '회원정보가 일치하지 않습니다.', 401)
        );
        return;
      }
      next(error);
    }
  }
);

userRouter.post(
  '/signUp',
  validateRequestWith(JoiSchema.signUp, 'body'),
  async (req, res, next) => {
    const { email, password, nickname } = req.body;

    try {
      const nick = await userService.addUser({
        email,
        password,
        nickname,
      });

      res.status(201).json({ nick });
    } catch (error) {
      if (error.name.includes('duplicated') || error.name.includes('failed')) {
        next(
          new AppError(
            'signUpFailed',
            '회원가입에 실패하였습니다. 서버 관리자에게 문의하십시오.',
            500
          )
        );
      }
      next(error);
    }
  }
);

userRouter.get('/signUp/available', async (req, res, next) => {
  const email = req.query.email;

  try {
    const available = await userService.checkEmailDuplicate(email);

    res.status(200).json({ available });
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

userRouter.get('/signCheck', async (req, res, next) => {
  try {
    const userToken = req.signedCookies[cookieName];

    if (!userToken || userToken === 'null') {
      await userService.deleteAllToken();
      res.status(200).json('false');
      return;
    }
    res.status(200).json('true');
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

userRouter.get('/signOut', signInCheck, async (req, res, next) => {
  try {
    if (req.currentUser) {
      res.clearCookie(cookieName);
      await userService.deleteUserToken(req.currentUser);
      res.status(200).json({ signOut: 'succeed' });
    }
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

userRouter.put('/update', async () => {});
userRouter.delete('/', async () => {});

export { userRouter };
