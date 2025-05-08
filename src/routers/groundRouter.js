import { Router } from 'express';
import { groundService } from '../services/index.js';
import {
  validateRequestWith,
  AppError,
  tokenCheck,
  imgSASUrlGenerator,
} from '../middlewares/index.js';
import * as JoiSchema from '../utils/joi-schemas/index.js';
import { upload } from '../utils/index.js';

const groundRouter = Router();

groundRouter.post(
  '/create',
  tokenCheck,
  upload.single('img'),
  imgSASUrlGenerator,
  validateRequestWith(JoiSchema.addGround, 'body'),
  async (req, res, next) => {
    const { name, description, id, imgInfo } = req.body;
    const email = req.currentUser;
    try {
      const newGround = await groundService.addGround({
        name,
        description,
        id,
        email,
        imgInfo,
      });
      const groundNameAndManager =
        await groundService.getGroundNameAndManager(newGround);
      res.status(201).json(groundNameAndManager);
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

// get ground id after create ground
groundRouter.get(
  '/name/:ground',
  tokenCheck,
  validateRequestWith(JoiSchema.groundName, 'params'),
  async (req, res, next) => {
    const groundName = req.params.ground;
    try {
      const { id } = await groundService.getGroundInfoByName(groundName);
      res.status(200).json({ id });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

groundRouter.get(
  '/:id',
  validateRequestWith(JoiSchema.groundId, 'params'),
  async (req, res, next) => {
    const groundId = req.params.id;
    try {
      const { name, id, description, manager, tab, rate, img } =
        await groundService.getGroundInfoByGroundId(groundId);
      const { imgUrl } = img || {};
      res
        .status(200)
        .json({ name, id, description, manager, tab, rate, imgUrl });
    } catch (error) {
      if (error.name.includes('GroundNotExistError')) {
        next(new AppError(error.name, error.message, 404));
      }
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

// search grounds by keyword
groundRouter.get(
  '',
  validateRequestWith(JoiSchema.keyword, 'query'),
  async (req, res, next) => {
    const { keyword } = req.query;
    try {
      if (typeof keyword === 'string') {
        // 서버(express)에서 자동으로 디코딩 해줘서 필요 없었음
        // const search = decodeURIComponent(keyword);
        const grounds = await groundService.getGroundsByKeyword(keyword);
        return res.status(200).json(grounds);
      }
      const grounds = await groundService.getAllGroundsInfo();
      res.status(200).json(grounds);
    } catch (error) {
      console.error(error);
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

groundRouter.get('/info/managing', tokenCheck, async (req, res, next) => {
  const email = req.currentUser;
  try {
    const grounds = await groundService.getGroundsByManager(email);
    res.status(200).json(grounds);
  } catch (error) {
    next(
      new AppError(
        'ServerError',
        '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
        500
      )
    );
  }
});

groundRouter.patch(
  '/img',
  tokenCheck,
  upload.single('img'),
  imgSASUrlGenerator,
  validateRequestWith(JoiSchema.updateImg, 'body'),
  async (req, res, next) => {
    const { id, name, imgInfo } = req.body;
    try {
      await groundService.updateImg({
        id,
        name,
        imgInfo,
      });
      res.status(200).json({ updateGroundImg: 'succeed' });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

groundRouter.patch(
  '/manager',
  tokenCheck,
  validateRequestWith(JoiSchema.updateManager, 'body'),
  async (req, res, next) => {
    const { id, name, manager } = req.body;
    try {
      await groundService.updateManager({ id, name, manager });
      res.status(200).json({ updateManager: 'succeed' });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

groundRouter.patch(
  '/description',
  tokenCheck,
  validateRequestWith(JoiSchema.updateDescription, 'body'),
  async (req, res, next) => {
    const { id, name, description } = req.body;
    try {
      await groundService.updateDescription({
        id,
        name,
        description,
      });
      res.status(200).json({ updateDescription: 'succeed' });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

groundRouter.patch(
  '/tab',
  tokenCheck,
  validateRequestWith(JoiSchema.updateTab, 'body'),
  async (req, res, next) => {
    const { id, name, tab } = req.body;
    try {
      await groundService.updateTab({
        id,
        name,
        tab,
      });
      res.status(200).json({ updateTab: 'succeed' });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

groundRouter.patch(
  '/rate',
  tokenCheck,
  validateRequestWith(JoiSchema.updateRate, 'body'),
  async (req, res, next) => {
    const { id, name, rate } = req.body;
    try {
      await groundService.updateRate({ id, name, rate });
      res.status(200).json({ updateRate: 'succeed' });
    } catch (error) {
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  }
);

export { groundRouter };
