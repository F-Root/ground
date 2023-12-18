import { model } from 'mongoose';
import { TokenSchema } from '../schemas/tokenSchema.js';

const Token = model('tokens', TokenSchema);

export class TokenModel {
  async createRefresh(token) {
    return await Token.create(token);
  }
  async findEmail(hashedEmail) {
    return await Token.findOne(
      { hashedEmail },
      { _id: 0, email: 1, hashedEmail: 1, nickname: 1 }
    );
  }
  async findRefreshToken(hashedEmail) {
    return await Token.findOne(
      { hashedEmail },
      { _id: 0, refreshToken: 1, email: 1 }
    );
  }
  // async updateToken(token) {}
  async deleteToken(email) {
    return await Token.deleteOne({ email });
  }
  async deleteAllToken() {
    return await Token.deleteMany({});
  }
}

const tokenModel = new TokenModel();

export { tokenModel };
