import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/index.js';

const accessKey = process.env.ACCESS_SECRET_KEY;
const refreshKey = process.env.REFRESH_SECRET_KEY;

export const jwtUtil = {
  generateAccessToken: ({ userId, createdAt }) => {
    const payload = { userId, createdAt };

    return jwt.sign(payload, accessKey, {
      algorithm: 'HS384',
      expiresIn: '1h',
    });
  },

  generateRefreshToken: ({ userId, createdAt }) => {
    const payload = { userId, createdAt };

    return jwt.sign(payload, refreshKey, {
      algorithm: 'HS512',
      expiresIn: '7d',
    });
  },

  verifyAccess: (access) => {
    try {
      return jwt.verify(access, accessKey);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(error.name, 'EXPIRED_ACCESS_TOKEN_ERROR', 401);
      } else {
        throw new AppError(error.name, 'INVALID_ACCESS_TOKEN_ERROR', 401);
      }
    }
  },

  verifyRefresh: (refresh) => {
    try {
      return jwt.verify(refresh, refreshKey);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(error.name, 'EXPIRED_REFRESH_TOKEN_ERROR', 401);
      } else {
        throw new AppError(error.name, 'INVALID_REFRESH_TOKEN_ERROR', 401);
      }
    }
  },

  decodedToken: (token) => {
    return jwt.decode(token);
  },
};
