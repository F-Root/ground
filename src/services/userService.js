import { userModel } from '../db/index.js';
import { jwtUtil, encryptObjId } from '../utils/index.js';
import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/index.js';
import { tokenService, imgService, groundService } from './index.js';

class UserService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getUserToken(signInfo) {
    const { id, password } = signInfo;
    const user = await this.userModel.findByUserId(id);
    if (!user) {
      throw new AppError(
        'InvalidUserIdError',
        '해당 아이디는 가입 내역이 없습니다. 다시 한 번 확인해 주세요.',
        500
      );
    }

    const hashedPassword = user.password;
    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordCorrect) {
      throw new AppError(
        'PasswordError',
        '비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.',
        500
      );
    }

    const userId = encryptObjId(user._id);
    const accessToken = jwtUtil.generateAccessToken({
      userId,
      createdAt: Date.now(),
    });
    const refreshToken = jwtUtil.generateRefreshToken({
      userId,
      createdAt: Date.now(),
    });

    const isRefreshTokenExist =
      await tokenService.getRefreshTokenInfoByAccessToken(accessToken);
    if (isRefreshTokenExist) {
      const deleted = await tokenService.deleteToken(accessToken);
      if (!deleted) {
        throw new AppError('DeleteError', 'token delete failed', 500);
      }
    }
    await tokenService.addRefreshTokenWithAccessToken({
      refreshToken,
      accessToken,
    });

    return accessToken;
  }

  async addUser(userInfo) {
    const { email, id, password, nickname } = userInfo;
    if (await this.userModel.findByEmail(email)) {
      throw new AppError(
        'EmailDuplicatedError',
        '이미 사용 중인 이메일입니다.',
        500
      );
    }
    if (await this.userModel.findByUserId(id)) {
      throw new AppError(
        'UserIdDuplicatedError',
        '이미 사용 중인 아이디입니다.',
        500
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserInfo = {
      email,
      id,
      password: hashedPassword,
      nickname,
    };
    const createdNewUser = await this.userModel.create(newUserInfo);
    if (!createdNewUser) {
      throw new AppError('SignUpError', '회원가입에 실패하였습니다.', 500);
    }
    return createdNewUser.nickname;
  }

  async checkPassword(userInfo) {
    const { email, passwordNow, passwordNew, passwordCheck } = userInfo;
    if (passwordNew !== passwordCheck) {
      throw new AppError(
        'PasswordNewError',
        '새 비밀번호가 서로 일치하지 않습니다.',
        500
      );
    }

    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new AppError(
        'InvalidEmailError',
        '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.',
        500
      );
    }

    const hashedPassword = user.password;
    const isPasswordCorrect = await bcrypt.compare(passwordNow, hashedPassword);
    if (!isPasswordCorrect) {
      throw new AppError(
        'PasswordNowError',
        '현재 비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.',
        500
      );
    }
  }

  async checkDuplicate({ id, email }) {
    const user = id
      ? await this.userModel.findByUserId(id)
      : await this.userModel.findByEmail(email);

    if (user) {
      return false;
    }
    return true;
  }

  async checkExist(email) {
    const user = await this.userModel.findByEmail(email);

    if (user) {
      return true;
    }
    return false;
  }

  async getUserInfoByUserId(userId) {
    return await this.userModel.findByUserId(userId);
  }

  async getUserInfoByEmail(email) {
    return await this.userModel.findByEmail(email);
  }

  async getUserEmail(objectId) {
    const { email } = await this.userModel.findByObjectId(objectId);
    return email;
  }

  async getUserId(objectId) {
    const { id } = await this.userModel.findByObjectId(objectId);
    return id;
  }

  async getSubscribeGrounds(email) {
    return await this.userModel.findSubscribesByEmail(email);
  }

  async getNotificateGrounds(email) {
    return await this.userModel.findNotificateByEmail(email);
  }

  async checkSubscribe({ email, groundId }) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.findSubscribeByEmailAndGround(email, ground);
  }

  async checkNotificate({ email, groundId }) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.findNotificateByEmailAndGround(email, ground);
  }

  async getGroundnotificateCount(groundId) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.findNotificateCountByGround(ground);
  }

  async getGroundSubscribeCount(groundId) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.findSubscriberCountByGround(ground);
  }

  async setGroundNotificate(groundId, email) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.updateGroundNotificate({
      email,
      ground,
      action: '$push',
    });
  }

  async unsetGroundNotificate(groundId, email) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.updateGroundNotificate({
      email,
      ground,
      action: '$pull',
    });
  }

  async setGroundSubscribe(groundId, email) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.updateGroundSubscribe({
      email,
      ground,
      action: '$push',
    });
  }

  async unsetGroundSubscribe(groundId, email) {
    const { _id: ground } =
      await groundService.getGroundInfoByGroundId(groundId);
    return await this.userModel.updateGroundSubscribe({
      email,
      ground,
      action: '$pull',
    });
  }

  async updateSubscribeList(email, subscribeList) {
    const groundList = (
      await groundService.getGroundsByGroundIds(subscribeList)
    ).map(({ _id }) => _id);
    return await this.userModel.updateSubscribes({ email, groundList });
  }

  async updateEmail({ emailNow, email }) {
    return await this.userModel.updateEmail({ emailNow, email });
  }

  async getNotificationRecipients({ post, creator }) {
    const { ground, tab } = post;
    return await this.userModel.findContentRecipients({
      creator,
      groundId: ground,
      tab,
    });
  }

  async updatePassword(userInfo) {
    const { email, passwordNew: password } = userInfo;

    const hashedPassword = await bcrypt.hash(password, 10);
    const updateUserPassword = await this.userModel.updatePassword({
      email,
      password: hashedPassword,
    });
    if (!updateUserPassword) {
      throw new AppError(
        'PasswordUpdateError',
        '비밀번호 변경을 실패하였습니다.',
        500
      );
    }
  }

  async updateProfile({ email, nickname, imgInfo }) {
    if (imgInfo) {
      const { _id } = (await this.userModel.findImgId({ email })) || {};
      // img object id가 존재하면 이미지를 업데이트
      if (_id) {
        const img = await imgService.updateImgInfo({ _id, ...imgInfo });
        return await this.userModel.updateProfile({ email, nickname, img });
      }
      // 존재하지 않는다면 이미지를 생성
      const img = await imgService.addImgInfo({ ...imgInfo });
      return await this.userModel.updateProfile({ email, nickname, img });
    }
    return await this.userModel.updateProfile({ email, nickname });
  }

  async updateCommentNotificate({ email, comment, reply }) {
    const commentSetter = comment === 'on' ? true : false;
    const replySetter = reply === 'on' ? true : false;
    return await this.userModel.updateCommentNotificate({
      email,
      commentSetter,
      replySetter,
    });
  }

  async updateNotification({ email, data }) {
    //get ground object id first
    const grounds = await groundService.getGroundsByGroundIds(
      Object.keys(data)
    );
    //convert to schema data
    const notificateData = grounds.reduce((acc, { _id, id }) => {
      acc[id].groundId = _id;
      return acc;
    }, data);
    return await this.userModel.updateNotificationSetting({
      email,
      notificateData,
    });
  }

  async deleteUserToken(accessToken) {
    const deleted = await tokenService.deleteToken(accessToken);
    if (!deleted) {
      throw new AppError('DeleteError', 'token delete failed', 500);
    }
  }

  async deleteAllToken() {
    const deleted = await tokenService.deleteAllToken();
    if (!deleted) {
      throw new AppError('DeleteError', 'token delete failed', 500);
    }
  }
}

const userService = new UserService(userModel);

export { userService };
