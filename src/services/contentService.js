import { contentModel } from '../db/index.js';
import { AppError } from '../middlewares/index.js';
import { userService, groundService, notificateService } from './index.js';

class ContentService {
  constructor(contentModel) {
    this.contentModel = contentModel;
  }

  async addContent(contentInfo) {
    const { category, title, content, email, groundId } = contentInfo;
    const { _id: author, nickname } =
      await userService.getUserInfoByEmail(email);
    if (!author) {
      throw new AppError(
        'User Not Exist Error',
        '유저가 존재하지 않습니다.',
        500
      );
    }
    const { _id: ground, tab } =
      await groundService.getGroundInfoByGroundId(groundId);
    if (!ground) {
      throw new AppError(
        'Ground Not Exist Error',
        '그라운드가 존재하지 않습니다.',
        500
      );
    }
    if (!tab.includes(category)) {
      throw new AppError(
        'Category Not Exist Error',
        '카테고리가 존재하지 않습니다.',
        500
      );
    }
    try {
      const post = await this.contentModel.create({
        tab: category,
        title,
        content,
        author,
        ground,
      });
      // 컨텐츠 알림 생성
      await notificateService.addNotification({
        type: 'content',
        post,
        creator: { id: author, nickname },
      });
      return post;
    } catch (error) {
      const errorCode = error.message;
      // 랜덤 url 생성 시 중복에러가 발생할 경우
      if (errorCode.includes('E11000')) {
        this.addContent(contentInfo);
        return;
      }
      console.error(error);
      throw new AppError(
        'Database Error',
        'DB에러가 발생했습니다. 관리자에게 문의해주세요.',
        500
      );
    }
  }

  async getContentsByGrounds(grounds) {
    const groundIds = grounds.map(({ id }) => id);
    const groundList = (
      await groundService.getGroundsByGroundIds(groundIds)
    ).map(({ _id }) => _id);
    return await this.contentModel.findByGrounds(groundList);
  }

  async getContentByContentUrl(url) {
    return await this.contentModel.findByContentUrl(url);
  }

  async getNumberOfContents(groundId, category = '전체') {
    const { _id: id } = await groundService.getGroundInfoByGroundId(groundId);
    if (!id) {
      throw new AppError(
        'Ground Not Exist Error',
        '그라운드가 존재하지 않습니다.',
        500
      );
    }
    const count = await this.contentModel.getContentCountByGround(id, category);
    return { id, count };
  }

  async getPaginationContents(groundId, category = '전체', page = 1) {
    const { id, count } = await this.getNumberOfContents(groundId, category);

    return await this.contentModel.getPaging(id, category, page, count);
  }

  async getNotificationRecipient({ post }) {
    const { content } = post;
    return await this.contentModel.findCommentRecipient(content);
  }
}

const contentService = new ContentService(contentModel);

export { contentService };
