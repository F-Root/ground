import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY || 'secret-key';

export const jwtUtil = {
  generateAccessToken: (user) => {
    const payload = { userId: user.userId, role: user.role };

    return jwt.sign(payload, secretKey, {
      algorithm: 'HS512',
      expiresIn: '7d',
    });
  },

  generateRefreshToken: (user) => {
    const payload = { userId: user.userId };

    return jwt.sign(payload, secretKey, {
      algorithm: 'HS512',
      expiresIn: '30d',
    });
  },

  decodedToken: (token) => {
    return jwt.decode(token);
  },

  verifyAccess: (access) => {
    try {
      const accessDecoded = jwt.verify(access, secretKey);
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
      const refreshDecoded = jwt.verify(refresh, secretKey);
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
};
