import { jwtUtil } from '../utils/jwtUtil.js';
import { tokenModel } from '../db/index.js';
import bcrypt from 'bcrypt';

const cookieName = process.env.COOKIE_NAME;

const signInCheck = async (req, res, next) => {
  const accessToken = req.signedCookies[cookieName];

  if (!accessToken || accessToken === 'null') {
    next(new Error('로그인한 유저만 사용할 수 있는 서비스입니다.'));
  }

  try {
    // access token verify
    const verifiedToken = jwtUtil.verifyAccess(accessToken);
    const tokenInfo = await tokenModel.findEmail(verifiedToken.user);
    const isEmailCorrect = await bcrypt.compare(
      tokenInfo.email,
      verifiedToken.user
    );
    if (!isEmailCorrect) {
      next(new Error('Invalid Cookie!!'));
    }
    req.currentUser = tokenInfo.email;
    next();
  } catch (error) {
    //access token이 만료된 경우에는 새롭게 토큰을 발급하고 쿠키를 리셋
    if (error.message === 'EXPIRED_ACCESS_TOKEN_ERROR') {
      const decodedToken = jwtUtil.decodedToken(accessToken);
      const { refreshToken, email } = await tokenModel.findRefreshToken(
        decodedToken.user
      );
      const isEmailCorrect = await bcrypt.compare(email, decodedToken.user);
      if (!isEmailCorrect) {
        next(new Error('Invalid Cookie!!'));
      }
      const newAccessToken = await regenerateAccessToken(refreshToken);
      req.currentUser = email;
      res.cookie(cookieName, newAccessToken, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //24시간
        httpOnly: true,
        signed: true,
      });
      next();
      return;
    }
    next(error);
  }
};

const regenerateAccessToken = async (refreshToken) => {
  try {
    // refresh token verify
    const verifiedRefreshToken = jwtUtil.verifyRefresh(refreshToken);

    // decode된 refresh token에서 user data 정보 얻기
    const { user, nickname } = verifiedRefreshToken;

    // access token 재발급
    const newAccessToken = jwtUtil.generateAccessToken({ user, nickname });
    return newAccessToken;
  } catch (error) {
    // refresh token 만료
    if (error.message === 'EXPIRED_REFRESH_TOKEN_ERROR') {
      throw new Error('로그인 후 이용하세요.');
    }
    // 유효하지 않은 refresh token
    if (error.message === 'INVALID_REFRESH_TOKEN_ERROR') {
      throw new Error('유효하지 않은 토큰입니다.');
    }
  }
};

export { signInCheck };
