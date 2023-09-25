import { userModel } from '../db/index.js';
import bcrypt from 'bcrypt';

class UserService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async addUser(userInfo) {
    const { email, password, name } = userInfo;

    const user = await this.userModel.findByEmail(email);
    if (user) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserInfo = {
      email,
      password: hashedPassword,
      name,
    };

    const createdNewUser = await this.userModel.create(newUserInfo);

    if (!createdNewUser) {
      throw new Error('회원가입에 실패하였습니다.');
    }

    return;
  }
  async getUserToken() {}
}

const userService = new UserService(userModel);

export { userService };
