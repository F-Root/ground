import { groundModel } from '../db/index.js';
import { AppError } from '../middlewares/index.js';
import { userService, imgService } from './index.js';
import { buildRegex, isNull } from '../views/public/util.js';
import { Hangul } from '../utils/hangul.js';

class GroundService {
  constructor(groundModel) {
    this.groundModel = groundModel;
  }

  async addGround(groundInfo) {
    const { name, description, id, email, imgInfo } = groundInfo;

    const groundName = await this.groundModel.findByGroundName(name);
    if (groundName) {
      throw new AppError(
        'GroundNameDuplicatedError',
        '이미 사용 중인 그라운드 이름입니다.\n다른 이름을 입력해 주세요.\n기존 그라운드가 운영 중이지 않은 경우 관리자에게 문의해 주세요.',
        500
      );
    }

    const groundId = await this.groundModel.findByGroundId(id);
    if (groundId) {
      throw new AppError(
        'GroundIdDuplicatedError',
        '이미 사용 중인 그라운드 ID입니다.\n다른 아이디를 입력해 주세요.\n사용하려는 ID가 운영 중이지 않은 경우 관리자에게 문의해 주세요.',
        500
      );
    }

    const userId = await userService.getUserInfoByEmail(email);
    if (!userId) {
      throw new AppError(
        'UserNotExistError',
        '유저가 존재하지 않습니다.\n관리자에게 문의해 주세요.',
        500
      );
    }

    const img = imgInfo ? await imgService.addImgInfo(imgInfo) : null;

    const createdNewGround = await this.groundModel.create({
      name,
      img,
      description,
      id,
      manager: userId,
      // tab: ['전체'],
    });
    if (!createdNewGround) {
      throw new AppError(
        'GroundCreatedFailed',
        '그라운드 생성에 실패하였습니다. 관리자에게 문의해 주세요.',
        500
      );
    }

    return createdNewGround;
  }

  async getAllGroundsInfo() {
    return await this.groundModel.findAllGrounds();
  }

  async getGroundsByGroundIds(ids) {
    return await this.groundModel.findByGroundIds(ids);
  }

  async getGroundsByManager(email) {
    const { _id: manager } = await userService.getUserInfoByEmail(email);
    if (!manager) {
      throw new AppError(
        'ManagerNotExistError',
        '매니저가 존재하지 않습니다.\n관리자에게 문의해 주세요.',
        500
      );
    }
    return await this.groundModel.findByGroundManager(manager);
  }

  async getGroundsByKeyword(keyword) {
    if (keyword) {
      // 한글 검색어일 경우 자음 모음을 분리
      keyword = Hangul.toString(keyword);
      const regexp = buildRegex(keyword);
      return await this.groundModel.findByKeywordRegexp(regexp);
    }
    return [];
  }

  async getGroundNameAndManager(ground) {
    const { name, manager } =
      await this.groundModel.findGroundNameAndManager(ground);
    return { name, manager: manager.nickname };
  }

  async getGroundInfoByGroundId(id) {
    const groundInfo = await this.groundModel.findByGroundId(id);
    if (isNull(groundInfo)) {
      throw new AppError(
        'GroundNotExistError',
        '그라운드가 존재하지 않습니다.',
        500
      );
    }
    return groundInfo;
  }

  async getGroundInfoByName(name) {
    return await this.groundModel.findByGroundName(name);
  }

  async updateImg({ id, name, imgInfo }) {
    const { _id } = (await this.groundModel.findImgId({ id, name })) || {};
    // img object id가 존재하면 이미지를 업데이트
    if (_id) {
      const img = await imgService.updateImgInfo({ _id, ...imgInfo });
      return await this.groundModel.updateImg({ id, name, img });
    }
    // 존재하지 않는다면 이미지를 생성
    const img = await imgService.addImgInfo({ ...imgInfo });
    return await this.groundModel.updateImg({ id, name, img });
  }

  async updateManager({ id, name, manager }) {
    const userId = await userService.getUserInfoByEmail(manager);
    if (!userId) {
      throw new AppError(
        'User Not Exist Error',
        '유저가 존재하지 않습니다.\n관리자에게 문의해 주세요.',
        500
      );
    }
    return await this.groundModel.updateManager({ id, name, manager: userId });
  }

  async updateDescription({ id, name, description }) {
    return await this.groundModel.updateDescription({ id, name, description });
  }

  async updateTab({ id, name, tab }) {
    return await this.groundModel.updateTab({ id, name, tab });
  }

  async updateRate({ id, name, rate }) {
    return await this.groundModel.updateRate({ id, name, rate: Number(rate) });
  }
}

const groundService = new GroundService(groundModel);

export { groundService };
