import { Router } from 'express';
import { contentService } from '../services/index.js';
import {
  validateRequestWith,
  AppError,
  tokenCheck,
} from '../middlewares/index.js';
import * as JoiSchema from '../utils/joi-schemas/index.js';

const contentRouter = new Router();

contentRouter.post(
  '/create',
  tokenCheck,
  validateRequestWith(JoiSchema.addContent, 'body'),
  async (req, res, next) => {
    const { category, title, content, groundId } = req.body;
    const email = req.currentUser;
    // let url = '';
    try {
      // for (let i = 0; i < 20; i++) {
      //   await contentService.addContent({
      //     category,
      //     title: title + i,
      //     content: content,
      //     email,
      //     groundId,
      //   });
      // }
      const { url } = await contentService.addContent({
        category,
        title,
        content,
        email,
        groundId,
      });
      res.status(201).json({ url });
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

// all contents
contentRouter.get(
  '',
  validateRequestWith(JoiSchema.grounds, 'query'),
  async (req, res, next) => {
    const { grounds } = req.query;
    try {
      const contents = await contentService.getContentsByGrounds(grounds);
      res.status(200).json(contents);
    } catch (error) {
      console.error(error);
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

// get content by url
contentRouter.get(
  '/:url',
  validateRequestWith(JoiSchema.contentUrl, 'params'),
  async (req, res, next) => {
    const contentUrl = req.params.url;
    try {
      const {
        title,
        tab,
        content,
        author: { id, email, nickname },
        view,
        rate,
        url,
        createdAt,
      } = await contentService.getContentByContentUrl(contentUrl);
      res.status(200).json({
        title,
        tab,
        content,
        author: { id, email, nickname },
        view,
        rate,
        url,
        createdAt,
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

// get contents count for page button
contentRouter.get(
  '/number/ground/:id',
  validateRequestWith(JoiSchema.groundId, 'params'),
  validateRequestWith(JoiSchema.numberOfContents, 'query'),
  async (req, res, next) => {
    const groundId = req.params.id;
    const { category } = req.query;
    try {
      const { count } = await contentService.getNumberOfContents(
        groundId,
        category
      );
      res.status(200).json(count);
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

contentRouter.get(
  '/ground/:id',
  validateRequestWith(JoiSchema.groundId, 'params'),
  validateRequestWith(JoiSchema.paginationContents, 'query'),
  async (req, res, next) => {
    const groundId = req.params.id;
    const { category, page } = req.query;
    try {
      const contents = await contentService.getPaginationContents(
        groundId,
        category,
        page
      );
      res.status(200).json({
        contents,
        category: category === undefined ? '전체' : category,
        page: page === undefined ? 1 : page,
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

export { contentRouter };
