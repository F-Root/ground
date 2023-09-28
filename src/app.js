import express from 'express';
import * as Routers from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//view
app.use(Routers.viewsRouter);

//api routing
app.use('/api', Routers.userRouter);

app.use(errorHandler);

export { app };
