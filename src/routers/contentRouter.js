import { Router } from 'express';
import { contentService } from '../services/index.js';
import {
  validateRequestWith,
  AppError,
  tokenCheck,
} from '../middlewares/index.js';

const contentRouter = new Router();

contentRouter.post('/create', tokenCheck, async (req, res, next) => {
  const { category, title, content, groundId } = req.body;
  const email = req.currentUser;
  try {
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
});

// all contents
contentRouter.get('', async (req, res, next) => {
  const grounds = JSON.parse(decodeURIComponent(req.query.grounds));
  try {
    const contents = await contentService.getContentsByGrounds(grounds);
    res.status(200).json(contents);
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

// get content by url
contentRouter.get('/:url', async (req, res, next) => {
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
    res.status(201).json({
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
});

// get contents count for page button
contentRouter.get('/number/ground/:id', async (req, res, next) => {
  const groundId = req.params.id;
  const { category } = req.query;
  try {
    const { count } = await contentService.getNumberOfContents(
      groundId,
      category
    );
    res.status(201).json(count);
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

contentRouter.get('/ground/:id', async (req, res, next) => {
  const groundId = req.params.id;
  const { category, page } = req.query;
  try {
    const contents = await contentService.getPaginationContents(
      groundId,
      category,
      page
    );
    res.status(201).json({
      contents,
      category: category === undefined ? '전체' : category,
      page: page === undefined ? 1 : page,
    });
  } catch (error) {
    next(error);
  }
});

export { contentRouter };
