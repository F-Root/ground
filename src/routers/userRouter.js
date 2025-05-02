import { Router } from 'express';
import { userService } from '../services/index.js';
import {
  tokenCheck,
  signInCheck,
  validateRequestWith,
  AppError,
  imgSASUrlGenerator,
  checkLastProfileUpdate,
} from '../middlewares/index.js';
import * as JoiSchema from '../utils/joi-schemas/index.js';
import { upload, authMailer } from '../utils/index.js';

const userRouter = Router();
const cookieName = process.env.COOKIE_NAME;

userRouter.post(
  '/signIn',
  validateRequestWith(JoiSchema.signIn, 'body'),
  async (req, res, next) => {
    const { id, password } = req.body;

    try {
      const accessToken = await userService.getUserToken({ id, password });

      res.cookie(cookieName, accessToken, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //24시간
        httpOnly: true,
        signed: true,
      });

      res.status(200).json({ signIn: 'succeed' });
    } catch (error) {
      if (
        error.name.includes('InvalidUserIdError') ||
        error.name.includes('PasswordError')
      ) {
        return next(
          new AppError('InvalidUserError', '회원정보가 일치하지 않습니다.', 401)
        );
      }
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
        // new AppError(error.name, error.message)
      );
    }
  }
);

userRouter.post(
  '/signUp',
  validateRequestWith(JoiSchema.signUp, 'body'),
  async (req, res, next) => {
    const { email, id, password, nickname } = req.body;

    try {
      const nick = await userService.addUser({
        email,
        id,
        password,
        nickname,
      });

      res.status(201).json({ nick });
    } catch (error) {
      if (
        error.name.includes('EmailDuplicatedError') ||
        error.name.includes('UserIdDuplicatedError') ||
        error.name.includes('SignUpError')
      ) {
        next(
          new AppError(
            'SignUpFailed',
            '회원가입에 실패하였습니다. 서버 관리자에게 문의하십시오.',
            500
          )
        );
        return;
      }
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

// mailer
userRouter.post(
  '/email',
  tokenCheck,
  validateRequestWith(JoiSchema.authEmail, 'body'),
  async (req, res, next) => {
    const { email, authNumber } = req.body;
    try {
      await authMailer(email, authNumber);
      res.status(200).json({ sendMail: 'succeed' });
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get('/signUp/available', async (req, res, next) => {
  const { email, id } = req.query;
  try {
    if (email) {
      const available = await userService.checkDuplicate({ email });
      return res.status(200).json({ available });
    }
    if (id) {
      const available = await userService.checkDuplicate({ id });
      return res.status(200).json({ available });
    }
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

// ground manager setting (ground update)
userRouter.get('/exist', tokenCheck, async (req, res, next) => {
  const email = req.query.email;
  try {
    const exist = await userService.checkExist(email);
    res.status(200).json({ exist });
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

// header sign check
userRouter.get('/signCheck', async (req, res, next) => {
  try {
    const userToken = req.signedCookies[cookieName];

    if (!userToken || userToken === 'null') {
      // await userService.deleteAllToken();
      res.status(200).json('false');
      return;
    }
    res.status(200).json('true');
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

// setting profile
userRouter.get('/loggedUser', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  try {
    const { nickname, img } = await userService.getUserInfoByEmail(email);
    const { imgUrl } = img || {};
    res.status(200).json({ nickname, imgUrl });
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

userRouter.get('/signOut', tokenCheck, signInCheck, async (req, res, next) => {
  try {
    if (req.currentUser) {
      const accessToken = req.signedCookies[cookieName];
      res.clearCookie(cookieName);
      await userService.deleteUserToken(accessToken);
      res.status(200).json({ signOut: 'succeed' });
    } else {
      res.status(200).json({ signOut: 'cookie deleted' });
    }
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

// setting account
userRouter.get('/info', tokenCheck, async (req, res, next) => {
  try {
    const email = req.currentUser;
    res.status(200).json(email);
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

// setting subscribe grounds
userRouter.get('/subscribe/grounds', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  try {
    const { subscribes } = await userService.getSubscribeGrounds(email);
    res.status(200).json(subscribes);
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

// setting notificate grounds
userRouter.get('/notificate/grounds', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  try {
    const {
      notifications: { comment, reply, content },
    } = await userService.getNotificateGrounds(email);
    res.status(200).json({ comment, reply, content });
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

userRouter.get(
  '/check/notificate/:groundId',
  tokenCheck,
  async (req, res, next) => {
    const { groundId } = req.params;
    const email = req.currentUser;
    try {
      const isNotificated = (await userService.checkNotificate({
        email,
        groundId,
      }))
        ? true
        : false;
      res.status(200).json({ isNotificated });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

userRouter.get(
  '/check/subscribe/:groundId',
  tokenCheck,
  async (req, res, next) => {
    const { groundId } = req.params;
    const email = req.currentUser;
    try {
      const isSubscribed = (await userService.checkSubscribe({
        email,
        groundId,
      }))
        ? true
        : false;
      res.status(200).json({ isSubscribed });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

userRouter.get('/notificate/:groundId', tokenCheck, async (req, res, next) => {
  const { groundId } = req.params;
  try {
    const notificate = await userService.getGroundnotificateCount(groundId);
    res.status(200).json(notificate);
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

userRouter.get('/subscribers/:groundId', tokenCheck, async (req, res, next) => {
  const { groundId } = req.params;
  try {
    const subscribers = await userService.getGroundSubscribeCount(groundId);
    res.status(200).json(subscribers);
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

userRouter.put(
  '/email',
  validateRequestWith(JoiSchema.updateEmail, 'body'),
  tokenCheck,
  async (req, res, next) => {
    const emailNow = req.currentUser;
    const { email } = req.body;
    try {
      await userService.updateEmail({ emailNow, email });
      res.status(200).json({ updateEmail: 'succeed' });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

userRouter.put('/password', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  const {
    'password-now': passwordNow,
    'password-new': passwordNew,
    'password-check': passwordCheck,
  } = req.body;

  try {
    await userService.checkPassword({
      email,
      passwordNow,
      passwordNew,
      passwordCheck,
    });
    await userService.updatePassword({ email, passwordNew });

    res.status(200).json({ updatePassword: 'succeed' });
  } catch (error) {
    if (
      error.name.includes('PasswordNewError') ||
      error.name.includes('PasswordNowError') ||
      error.name.includes('PasswordUpdateError')
    ) {
      return next(error);
    }
    next(
      new AppError(
        'ServerError',
        '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
        500
      )
    );
  }
});

userRouter.put('/subscribes', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  const subscribeList = req.body;
  try {
    await userService.updateSubscribeList(email, subscribeList);
    res.status(200).json({ updateSubscribeList: 'succeed' });
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

userRouter.patch(
  '/update',
  tokenCheck,
  checkLastProfileUpdate,
  upload.single('img'),
  imgSASUrlGenerator,
  async (req, res, next) => {
    const { imgInfo, nickname } = req.body;
    const email = req.currentUser;
    try {
      await userService.updateProfile({
        email,
        nickname,
        imgInfo,
      });
      res.status(200).json({ updateProfile: 'succeed' });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

userRouter.patch(
  '/notificate/:groundId',
  tokenCheck,
  async (req, res, next) => {
    const email = req.currentUser;
    const { groundId } = req.params;
    const { clickForNotificate } = req.query;
    let data;
    try {
      if (JSON.parse(clickForNotificate)) {
        await userService.setGroundNotificate(groundId, email);
        data = 'yes';
      } else {
        await userService.unsetGroundNotificate(groundId, email);
        data = 'no';
      }
      res.status(200).json(data);
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다. 서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

userRouter.patch('/subscribe/:groundId', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  const { groundId } = req.params;
  const { clickForSubscribe } = req.query;
  let data;
  try {
    if (JSON.parse(clickForSubscribe)) {
      await userService.setGroundSubscribe(groundId, email);
      data = 'yes';
    } else {
      await userService.unsetGroundSubscribe(groundId, email);
      data = 'no';
    }
    res.status(200).json(data);
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

userRouter.patch('/comment/notificate', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  const { comment, reply } = req.body;
  try {
    await userService.updateCommentNotificate({ email, comment, reply });
    res.status(200).json({ update: 'succeed' });
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

userRouter.patch('/notification', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  const data = req.body;
  try {
    await userService.updateNotification({ email, data });
    res.status(200).json({ update: 'succeed' });
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

userRouter.delete('/', async () => {});

export { userRouter };
