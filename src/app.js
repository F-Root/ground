import express from 'express';
import * as Routers from './routers/index.js';

const app = express();

//view
app.use(Routers.viewsRouter);

//api routing
app.use('/api', Routers.userRouter);

export { app };
