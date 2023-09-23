import { model } from 'mongoose';
import { UserSchema } from '../schemas/userSchema.js';

const User = model('users', UserSchema);

export class UserModel {
  async create(userInfo) {
    const createdNewUser = await User.create(userInfo);
    return createdNewUser;
  }

  async findByEmail(email) {
    const user = await User.findOne({ email });
    return user;
  }
}

const userModel = new UserModel();

export { userModel };
