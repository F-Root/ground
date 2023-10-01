import { userModel } from '../db/index.js';
import { jwtUtil } from '../utils/jwtUtil.js';
import bcrypt from 'bcrypt';

class UserService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async addUser(userInfo) {
    const { email, password, nickname } = userInfo;

    const user = await this.userModel.findByEmail(email);
    if (user) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserInfo = {
      email,
      password: hashedPassword,
      nickname,
    };

    const createdNewUser = await this.userModel.create(newUserInfo);

    if (!createdNewUser) {
      throw new Error('회원가입에 실패하였습니다.');
    }

    return;
  }

  async getUserToken(signInfo) {
    const { email, password } = signInfo;
    const user = await this.userModel.findByEmail(email);

    if (!user) {
      throw new Error(
        '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.'
      );
    }

    const correctPasswordHash = user.password;
    const isPasswordCorrect = await bcrypt.compare(
      password,
      correctPasswordHash
    );

    if (!isPasswordCorrect) {
      throw new Error(
        '비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.'
      );
    }

    const accessToken = jwtUtil.generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = jwtUtil.generateRefreshToken({
      userId: user._id,
      role: user.role,
    });

    return { accessToken, refreshToken };
  }
}

const userService = new UserService(userModel);

export { userService };
