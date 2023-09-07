import express from 'express';
import path from 'path';

const viewsRouter = express.Router();
const __dirname = path.resolve();

const serveStatic = (resource) => {
  const resourcePath = path.join(__dirname, `src/views`);
  const option = { index: `${resource}.html` };
  return express.static(resourcePath, option);
};

viewsRouter.use('/', serveStatic('index'));

export { viewsRouter };
