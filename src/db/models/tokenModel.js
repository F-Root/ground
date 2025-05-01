import { model } from 'mongoose';
import { TokenSchema } from '../schemas/tokenSchema.js';

const Token = model('tokens', TokenSchema);

class TokenModel {
  async createToken({ refreshToken, accessToken }) {
    return await Token.create({ refreshToken, accessToken });
  }
  async findRefreshTokenByAccessToken(accessToken) {
    return await Token.findOne({ accessToken }, { _id: 0, refreshToken: 1 });
  }
  async updateToken(prevAccessToken, newAccessToken) {
    return await Token.updateOne(
      { accessToken: prevAccessToken },
      { $set: { accessToken: newAccessToken } }
    );
  }
  async deleteToken(accessToken) {
    return await Token.deleteOne({ accessToken });
  }
  async deleteAllToken() {
    return await Token.deleteMany({});
  }
}

const tokenModel = new TokenModel();

export { tokenModel };
