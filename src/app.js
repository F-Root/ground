import express from 'express';
import * as Routers from './routers/index.js';
import cookieParser from 'cookie-parser';
import { errorHandler, tokenCheck } from './middlewares/index.js';

const app = express();

// cookie
app.use(cookieParser(process.env.COOKIE_SECRET));
// Content-Type: application/json
app.use(express.json());
// Content-Type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// view
// app.use(Routers.viewsRouter);
app.use(Routers.viewsRouterWebpack);

// api routing
app.use('/api/user', Routers.userRouter);
app.use('/api/ground', Routers.groundRouter);
app.use('/api/content', Routers.contentRouter);
app.use('/api/comment', Routers.commentRouter);
app.use('/api/notificate', Routers.notificateRouter);

// renew credential
app.post('/api/renew/credential', tokenCheck, (req, res, next) => {
  res.status(200).json({ renew: 'succeed' });
});

// error handler
app.use(errorHandler);

export { app };
