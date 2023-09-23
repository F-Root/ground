import { userModel } from '../db/index.js';

class UserService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getUserToken() {}
}

const userService = new UserService(userModel);

export { userService };
