import express from 'express';
import path from 'path';
import { signInCheck, tokenCheck } from '../middlewares/index.js';

const viewsRouter = express.Router();
const __dirname = path.resolve();

const serveStatic = (staticPath, staticResource, headerSetting) => {
  if (staticPath) {
    const resourcePath = path.join(__dirname, `src/views/${staticPath}`);

    const option = headerSetting
      ? { index: `${staticResource}.html`, setHeaders: headerSetting }
      : { index: `${staticResource}.html` };
    return express.static(resourcePath, option);
  }
  const resourcePath = path.join(__dirname, `src/views`);
  return express.static(resourcePath);
};

// browser cache disable
const setHeadersDisableCache = (res, path, stat) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
};

// static file mounting middleware
viewsRouter.use(serveStatic());

// view Routing

// user views
viewsRouter.use('/', serveStatic('main', 'main'));

viewsRouter.use(
  '/signin',
  serveStatic('signin', 'signin', setHeadersDisableCache)
);
viewsRouter.use(
  '/signup',
  serveStatic('signup', 'signup', setHeadersDisableCache)
);
viewsRouter.get('/settings', tokenCheck, signInCheck, (req, res) => {
  res.redirect('/settings/profile');
});
viewsRouter.use(
  '/settings/profile',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/profile', 'profile', setHeadersDisableCache)
);
viewsRouter.use(
  '/settings/grounds',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/grounds', 'grounds', setHeadersDisableCache)
);
viewsRouter.use(
  '/settings/account',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/account', 'account', setHeadersDisableCache)
);
viewsRouter.use(
  '/settings/password',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/password', 'password', setHeadersDisableCache)
);
viewsRouter.use(
  '/settings/notificate',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/notificate', 'notificate', setHeadersDisableCache)
);

// ground views
viewsRouter.use(
  '/ground/create',
  tokenCheck,
  signInCheck,
  serveStatic('/ground/create', 'create', setHeadersDisableCache)
);
viewsRouter.use(
  '/ground/update',
  tokenCheck,
  signInCheck,
  serveStatic('/ground/update', 'update', setHeadersDisableCache)
);
viewsRouter.use(
  '/ground/:ground',
  serveStatic('/ground/board', 'board', setHeadersDisableCache)
);

// post views (editor)
viewsRouter.use(
  '/ground/:ground/new',
  serveStatic('/post/new', 'new', setHeadersDisableCache)
);
viewsRouter.use(
  '/ground/:ground/:id',
  serveStatic('/ground/view', 'view', setHeadersDisableCache)
);

export { viewsRouter };
