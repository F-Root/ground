import jwt from 'jsonwebtoken';

const accessKey = process.env.ACCESS_SECRET_KEY;
const refreshKey = process.env.REFRESH_SECRET_KEY;

export const jwtUtil = {
  generateAccessToken: (user) => {
    const payload = { userId: user.userId, role: user.role };

    return jwt.sign(payload, accessKey, {
      algorithm: 'HS384',
      expiresIn: '1h',
    });
  },

  generateRefreshToken: (user) => {
    const payload = { userId: user.userId };

    return jwt.sign(payload, refreshKey, {
      algorithm: 'HS512',
      expiresIn: '14d',
    });
  },

  verifyAccess: (access) => {
    try {
      const accessDecoded = jwt.verify(access, accessKey);
      return {
        userId: accessDecoded.userId,
        role: accessDecoded.role,
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
        userId: refreshDecoded.userId,
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
