import { userModel, tokenModel } from '../db/index.js';
import { jwtUtil } from '../utils/jwtUtil.js';
import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/index.js';

class UserService {
  constructor(userModel, tokenModel) {
    this.userModel = userModel;
    this.tokenModel = tokenModel;
  }

  async getUserToken(signInfo) {
    const { email, password } = signInfo;
    const user = await this.userModel.findByEmail(email);

    if (!user) {
      throw new AppError(
        'emailError',
        '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.',
        500
      );
    }

    const hashedPassword = user.password;
    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordCorrect) {
      throw new AppError(
        'passwdError',
        '비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.',
        500
      );
    }

    const hashedEmail = await bcrypt.hash(user.email, 10);
    const accessToken = jwtUtil.generateAccessToken({
      user: hashedEmail,
      nickname: user.nickname,
    });
    const refreshToken = jwtUtil.generateRefreshToken({
      user: hashedEmail,
      nickname: user.nickname,
    });

    await this.tokenModel.createRefresh({
      refreshToken,
      email: user.email,
      hashedEmail,
      nickname: user.nickname,
    });

    return accessToken;
  }

  async addUser(userInfo) {
    const { email, password, nickname } = userInfo;

    const user = await this.userModel.findByEmail(email);
    if (user) {
      throw new AppError('duplicated', '이미 사용 중인 이메일입니다.', 500);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserInfo = {
      email,
      password: hashedPassword,
      nickname,
    };

    const createdNewUser = await this.userModel.create(newUserInfo);

    if (!createdNewUser) {
      throw new AppError('failed', '회원가입에 실패하였습니다.', 500);
    }

    return createdNewUser.nickname;
  }

  async checkEmailDuplicate(email) {
    const user = await this.userModel.findByEmail(email);

    if (user) {
      return false;
    }
    return true;
  }

  async deleteUserToken(email) {
    const deleted = await this.tokenModel.deleteToken(email);

    if (!deleted) {
      throw new AppError('failed', 'token delete error', 500);
    }
  }

  async deleteAllToken() {
    const deleted = await this.tokenModel.deleteAllToken();
    if (!deleted) {
      throw new AppError('failed', 'token delete error', 500);
    }
  }
}

const userService = new UserService(userModel, tokenModel);

export { userService };
