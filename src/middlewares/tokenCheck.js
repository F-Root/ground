import { jwtUtil } from '../utils/index.js';
import { tokenService } from '../services/index.js';
import { AppError } from './index.js';
import { isNull } from '../views/public/util.js';

const cookieName = process.env.COOKIE_NAME;

const tokenCheck = async (req, res, next) => {
  const accessToken = req.signedCookies[cookieName];
  console.log('\x1b[31m%s', '======= token =======', accessToken);
  if (!accessToken || accessToken === 'null') {
    return next(
      new AppError(
        'Unauthorized',
        '로그인 후 사용할 수 있는 서비스입니다.',
        403
      )
    );
  }
  try {
    // verify access token
    const verifiedToken = jwtUtil.verifyAccess(accessToken);
    req.currentUser = await getCurrentUserEmail(verifiedToken);

    // check url is '/signin'
    if (req.originalUrl.includes('/signin')) {
      return res.redirect('/');
    }

    // check url is '/signup'
    if (req.originalUrl.includes('/signup')) {
      return res.redirect('/');
    }

    next();
  } catch (error) {
    //access token이 만료된 경우에는 새롭게 토큰을 발급하고 쿠키를 리셋
    if (error.message === 'EXPIRED_ACCESS_TOKEN_ERROR') {
      try {
        const refreshToken = await getRefreshToken(accessToken);
        const newAccessToken = await regenerateAccessToken(refreshToken);

        // update token in DB
        await tokenService.updateToken(accessToken, newAccessToken);

        // verify new access token
        const verifiedToken = jwtUtil.verifyAccess(newAccessToken);
        req.currentUser = await getCurrentUserEmail(verifiedToken);
        res.cookie(cookieName, newAccessToken, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //24시간
          httpOnly: true,
          signed: true,
        });
        return next();
      } catch (error) {
        return next(error);
      }
    }
    next(error);
  }
};

const getCurrentUserEmail = async (verifiedToken) => {
  return await tokenService.getUserEmail(verifiedToken);
};

const getRefreshToken = async (prevAccessToken) => {
  // const decodedToken = jwtUtil.decodedToken(accessToken);
  const { refreshToken } =
    (await tokenService.getRefreshTokenInfoByAccessToken(prevAccessToken)) ??
    {};
  if (isNull(refreshToken)) {
    throw new AppError(
      'RefreshTokenNotExist',
      '리프레쉬 토큰이 존재하지 않습니다.',
      401
    );
  }

  return refreshToken;
};

const regenerateAccessToken = async (refreshToken) => {
  try {
    // verify refresh token
    const verifiedRefreshToken = jwtUtil.verifyRefresh(refreshToken);

    // decode된 refresh token에서 user data 정보 얻기
    const { userId } = verifiedRefreshToken;

    // access token 재발급
    const newAccessToken = jwtUtil.generateAccessToken({
      userId,
    });
    return newAccessToken;
  } catch (error) {
    // refresh token 만료
    if (error.message === 'EXPIRED_REFRESH_TOKEN_ERROR') {
      throw new AppError('TokenExpired', '로그인 후 이용하세요.', 403);
    }
    // 유효하지 않은 refresh token
    if (error.message === 'INVALID_REFRESH_TOKEN_ERROR') {
      throw new AppError('InvalidToken', '유효하지 않은 토큰입니다.', 401);
    }
  }
};

export { tokenCheck };
