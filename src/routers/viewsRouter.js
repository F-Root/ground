import express from 'express';
import path from 'path';

const viewsRouter = express.Router();
const __dirname = path.resolve();

const serveStatic = (resource) => {
  const resourcePath = path.join(__dirname, 'src/views');
  console.log(resourcePath);
  const option = { index: `${resource}.html` };
  return express.static(resourcePath, option);
};

viewsRouter.use('/', serveStatic('main'));
viewsRouter.use('/signin', serveStatic('signIn'));
viewsRouter.use('/signup', serveStatic('signUp'));

export { viewsRouter };
