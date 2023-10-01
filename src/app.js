import express from 'express';
import * as Routers from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

const app = express();

// cookie
app.use(cookieParser(process.env.COOKIE_SECRET));
// Content-Type: application/json
app.use(express.json());
// Content-Type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//view
app.use(Routers.viewsRouter);

//api routing
app.use('/api', Routers.userRouter);

app.use(errorHandler);

export { app };
