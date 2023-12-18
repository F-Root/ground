import { model } from 'mongoose';
import { UserSchema } from '../schemas/userSchema.js';

const User = model('users', UserSchema);

export class UserModel {
  async create(userInfo) {
    return await User.create(userInfo);
  }

  async findByEmail(email) {
    return await User.findOne({ email }, { _id: 0 });
  }
}

const userModel = new UserModel();

export { userModel };
