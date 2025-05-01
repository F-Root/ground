import { userService } from '../services/index.js';
import { AppError } from './index.js';
import moment from 'moment';

const checkLastProfileUpdate = async (req, res, next) => {
  const email = req.currentUser;
  try {
    // 마지막 프로파일 업데이트 날짜 확인.
    const { profileUpdatedAt } =
      (await userService.getUserInfoByEmail(email)) ?? {};
    const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
    const timeSinceLastUpdate =
      Date.now() - new Date(profileUpdatedAt).getTime();
    if (timeSinceLastUpdate < THIRTY_DAYS_MS) {
      throw new AppError(
        'UpdateError',
        // 'Profile update is allowed only every 30 days.',
        '프로필 변경은 30일마다 가능합니다.\n마지막 변경일 : ' +
          moment(profileUpdatedAt).format('YYYY년 MM월 DD일'),
        400
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { checkLastProfileUpdate };
