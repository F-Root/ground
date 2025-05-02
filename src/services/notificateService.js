import { notificateModel } from '../db/index.js';
import { commentService, contentService, userService } from './index.js';

class NotificateService {
  constructor(notificateModel) {
    this.notificateModel = notificateModel;
  }

  async addNotification({ type, post, creator }) {
    if (type === 'content') {
      // get all notification recipients (except creator user)
      const recipients = await userService.getNotificationRecipients({
        post,
        creator: creator.id,
      });
      // create notifications
      await this.notificateModel.create(
        recipients.map(({ _id }) => ({
          user: _id,
          type,
          sourceId: post._id,
          sourceModel: 'contents',
          creator,
        }))
      );
    } else if (type === 'comment') {
      // get notification recipient = content creator
      // comment 속의 content 속의 author정보 get
      const recipient = await contentService.getNotificationRecipient({
        post,
      });
      // create notifications
      await this.notificateModel.create(
        recipient.map(({ author }) => ({
          user: author,
          type,
          sourceId: post._id,
          sourceModel: 'comments',
          creator,
        }))
      );
    } else if (type === 'reply') {
      // get notification recipient = comment or reply writer
      const recipient = await commentService.getNotificationRecipient({
        post,
      });
      // create notifications
      await this.notificateModel.create(
        recipient.map(({ author }) => ({
          user: author,
          type,
          sourceId: post._id,
          sourceModel: 'comments',
          creator,
        }))
      );
    }

    // event trigger
    // recipients.forEach(({ id }) => {
    //   contentNotificationEmitter.emit(
    //     'newContent',
    //     id,
    //     post,
    //     groundName,
    //     creator.nickname
    //   );
    // });
  }

  async getAllNotificationsByUser(userId) {
    const { _id } = await userService.getUserInfoByUserId(userId);
    return await this.notificateModel.findByUserId(_id);
    // 전송된 알림들은 send = true 처리(업데이트) -> 사용 X (isRead가 있어서 할 필요 없음)
    // const ids = notifications.map(({ _id }) => _id);
    // await this.updateSent(ids);
    // return notifications;
  }
  async updateSent(notifications) {
    return await this.notificateModel.updateSent(notifications);
  }
  async updateAllRead({ email }) {
    const { _id: user } = await userService.getUserInfoByEmail(email);
    return await this.notificateModel.updateAllRead({ user });
  }
  async updateContentRead({ email, url }) {
    const { _id: user } = await userService.getUserInfoByEmail(email);
    return await this.notificateModel.updateContentRead({ user, url });
  }
  async updateCommentRead({ email, url }) {
    const { _id: user } = await userService.getUserInfoByEmail(email);
    return await this.notificateModel.updateCommentRead({
      user,
      url,
    });
  }
}

const notificateService = new NotificateService(notificateModel);

export { notificateService };
