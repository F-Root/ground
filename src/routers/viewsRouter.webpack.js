import express from 'express';
import path from 'path';
import { signInCheck, tokenCheck } from '../middlewares/index.js';

const viewsRouterWebpack = express.Router();
const __dirname = path.resolve();

const serveStatic = (staticPath, staticResource, headerSetting) => {
  if (staticPath) {
    // const resourcePath = path.join(__dirname, `src/views/${staticPath}`);
    const resourcePath = path.join(__dirname, `dist`); // webpack bundle

    const option = headerSetting
      ? { index: `${staticResource}.html`, setHeaders: headerSetting }
      : { index: `${staticResource}.html` };
    return express.static(resourcePath, option);
  }
  // const resourcePath = path.join(__dirname, `src/views`);
  const resourcePath = path.join(__dirname, `dist`);
  return express.static(resourcePath);
};

// browser cache disable
const setHeadersDisableCache = (res, path, stat) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
};

// static file mounting middleware
viewsRouterWebpack.use(serveStatic());

// view Routing

// user views
viewsRouterWebpack.use('/', serveStatic('main', 'main'));

viewsRouterWebpack.use(
  '/signin',
  serveStatic('signin', 'signin', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/signup',
  serveStatic('signup', 'signup', setHeadersDisableCache)
);
viewsRouterWebpack.get('/settings', tokenCheck, signInCheck, (req, res) => {
  res.redirect('/settings/profile');
});
viewsRouterWebpack.use(
  '/settings/profile',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/profile', 'settings.profile', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/settings/grounds',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/grounds', 'settings.grounds', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/settings/account',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/account', 'settings.account', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/settings/password',
  tokenCheck,
  signInCheck,
  serveStatic('/settings/password', 'settings.password', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/settings/notificate',
  tokenCheck,
  signInCheck,
  serveStatic(
    '/settings/notificate',
    'settings.notificate',
    setHeadersDisableCache
  )
);

// ground views
viewsRouterWebpack.use(
  '/ground/create',
  tokenCheck,
  signInCheck,
  serveStatic('/ground/create', 'ground.create', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/ground/update/:ground',
  tokenCheck,
  signInCheck,
  serveStatic('/ground/update', 'ground.update', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/ground/:ground',
  tokenCheck,
  signInCheck,
  serveStatic('/ground/board', 'ground.board', setHeadersDisableCache)
);
viewsRouterWebpack.use(
  '/ground/:ground/:id',
  tokenCheck,
  signInCheck,
  serveStatic('/ground/view', 'ground.view', setHeadersDisableCache)
);

// post views (editor)
viewsRouterWebpack.use(
  '/ground/:ground/new',
  tokenCheck,
  signInCheck,
  serveStatic('/post/new', 'post.new', setHeadersDisableCache)
);

export { viewsRouterWebpack };
