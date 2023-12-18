import jwt from 'jsonwebtoken';

const accessKey = process.env.ACCESS_SECRET_KEY;
const refreshKey = process.env.REFRESH_SECRET_KEY;

export const jwtUtil = {
  generateAccessToken: ({ user, nickname }) => {
    const payload = { user, nickname };

    return jwt.sign(payload, accessKey, {
      algorithm: 'HS384',
      expiresIn: '1h',
    });
  },

  generateRefreshToken: ({ user, nickname }) => {
    const payload = { user, nickname };

    return jwt.sign(payload, refreshKey, {
      algorithm: 'HS512',
      expiresIn: '7d',
    });
  },

  verifyAccess: (access) => {
    try {
      const accessDecoded = jwt.verify(access, accessKey);
      return {
        user: accessDecoded.user,
        nickname: accessDecoded.nickname,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('EXPIRED_ACCESS_TOKEN_ERROR');
      } else {
        throw new Error('INVALID_ACCESS_TOKEN_ERROR');
      }
    }
  },

  verifyRefresh: (refresh) => {
    try {
      const refreshDecoded = jwt.verify(refresh, refreshKey);
      return {
        user: refreshDecoded.user,
        nickname: refreshDecoded.nickname,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('EXPIRED_REFRESH_TOKEN_ERROR');
      } else {
        throw new Error('INVALID_REFRESH_TOKEN_ERROR');
      }
    }
  },

  decodedToken: (token) => {
    return jwt.decode(token);
  },
};
