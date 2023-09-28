import { Router } from 'express';
import { userService } from '../services/index.js';

const userRouter = Router();

userRouter.post('/signIn', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userToken = await userService.getUserToken({ email, password });

    res.cookie('userInfo', userToken, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //24시간
      httpOnly: true,
      signed: true,
    });

    res.status(200).json({ signIn: 'succeed' });
  } catch (error) {
    next(error);
  }
});

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
