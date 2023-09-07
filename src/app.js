import express from 'express';
import { viewsRouter } from './routers/viewsRouter.js';

const app = express();

app.use(viewsRouter);

export { app };
