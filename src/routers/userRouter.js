import { Router } from 'express';
import { userService } from '../services/index.js';

const userRouter = Router();

userRouter.post('/signIn', async () => {});
userRouter.post('/signUp', async (req, res, next) => {
  const { email, password, name } = req.body;

  try {
    await userService.addUser({
      email,
      password,
      name,
    });

    res.status(201).json({ sighUp: 'succeed' });
  } catch (error) {
    next(error);
  }
});
userRouter.put('/update', async () => {});
userRouter.delete('/', async () => {});

export { userRouter };
