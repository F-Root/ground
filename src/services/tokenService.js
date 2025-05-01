import { tokenModel } from '../db/index.js';
import { userService } from './index.js';
import { decryptObjId } from '../utils/index.js';

class TokenService {
  constructor(tokenModel) {
    this.tokenModel = tokenModel;
  }

  async addRefreshTokenWithAccessToken({ refreshToken, accessToken }) {
    return await this.tokenModel.createToken({ refreshToken, accessToken });
  }

  async getUserEmail({ userId }) {
    const objectId = decryptObjId(userId);
    return await userService.getUserEmail(objectId);
  }

  async getUserId({ userId }) {
    const objectId = decryptObjId(userId);
    return await userService.getUserId(objectId);
  }

  async getRefreshTokenInfoByAccessToken(accessToken) {
    return await this.tokenModel.findRefreshTokenByAccessToken(accessToken);
  }

  async updateToken(prevAccessToken, newAccessToken) {
    return await this.tokenModel.updateToken(prevAccessToken, newAccessToken);
  }

  async deleteToken(accessToken) {
    return await this.tokenModel.deleteToken(accessToken);
  }
  async deleteAllToken() {
    return await this.tokenModel.deleteAllToken();
  }
}

const tokenService = new TokenService(tokenModel);

export { tokenService };
