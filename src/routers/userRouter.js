import { Router } from 'express';
// import { userService } from '../services/index.js';

const userRouter = Router();

userRouter.post('/signIn', async () => {});
userRouter.post('/signUp', async () => {});
userRouter.put('/update', async () => {});
userRouter.delete('/', async () => {});

export { userRouter };
