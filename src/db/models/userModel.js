import { model } from 'mongoose';
import { UserSchema } from '../schemas/userSchema.js';

const User = model('users', UserSchema);

class UserModel {
  async create(userInfo) {
    return await User.create(userInfo);
  }
  async findByEmail(email) {
    return await User.findOne({ email }).populate({
      path: 'img',
      select: { _id: 0, imgUrl: 1 },
    });
  }
  async findByUserId(id) {
    return await User.findOne({ id }).populate({
      path: 'img',
      select: { _id: 0, imgUrl: 1 },
    });
  }
  async findByObjectId(_id) {
    return await User.findOne({ _id }, { _id: 0, id: 1, email: 1 });
  }
  async findImgId({ email }) {
    const { img: _id } = await User.findOne({ email }, { _id: 0, img: 1 });
    return { _id };
  }
  async findSubscribesByEmail(email) {
    return await User.findOne({ email }, { _id: 0, subscribes: 1 }).populate({
      path: 'subscribes',
      select: { _id: 0, name: 1, id: 1 },
    });
  }
  async findNotificateByEmail(email) {
    return await User.findOne({ email }, { _id: 0, notifications: 1 }).populate(
      {
        path: 'notifications.content.ground',
        select: { _id: 0, name: 1, id: 1, tab: 1 },
      }
    );
  }
  async findNotificateByEmailAndGround(email, groundId) {
    return await User.findOne({
      email,
      'notifications.content.ground': groundId,
    });
  }
  async findSubscribeByEmailAndGround(email, groundId) {
    return await User.findOne({ email, subscribes: groundId });
  }
  async findNotificateCountByGround(groundId) {
    return await User.countDocuments({
      'notifications.content.ground': groundId,
    });
  }
  async findSubscriberCountByGround(groundId) {
    return await User.countDocuments({ subscribes: groundId });
  }
  async findContentRecipients({ creator, groundId, tab }) {
    return await User.find({
      _id: { $ne: creator },
      'notifications.content.ground': groundId,
      $or: [
        //recipient의 tab 목록에 게시물의 tab이 존재할 때.
        { 'notifications.content.tab': tab },
        {
          $and: [
            //recipient의 tab 목록에 게시물의 tab이 존재하지 않으면 '전체'인지 확인.
            { 'notifications.content.tab': { $ne: tab } },
            { 'notifications.content.tab': '전체' },
          ],
        },
      ],
    });
  }
  async updateEmail({ emailNow, email }) {
    return await User.findOneAndUpdate(
      { email: emailNow },
      { $set: { email } },
      { new: true, runValidators: true }
    );
  }
  async updateProfile({ email, nickname, img }) {
    return await User.findOneAndUpdate(
      { email },
      { nickname, img, profileUpdatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }
  async updateSubscribes({ email, groundList }) {
    return await User.findOneAndUpdate(
      { email },
      { subscribes: groundList },
      { new: true, runValidators: true }
    );
  }
  async updatePassword({ email, password }) {
    const filter = { email };
    const option = { new: true, runValidators: true };
    return await User.findOneAndUpdate(filter, { password }, option);
  }
  async updateGroundNotificate({ email, ground, action }) {
    return await User.findOneAndUpdate(
      { email },
      { [action]: { 'notifications.content': { ground } } },
      { new: true, runValidators: true }
    );
  }
  async updateGroundSubscribe({ email, ground, action }) {
    return await User.findOneAndUpdate(
      { email },
      { [action]: { subscribes: ground } },
      { new: true, runValidators: true }
    );
  }
  async updateCommentNotificate({ email, commentSetter, replySetter }) {
    return await User.findOneAndUpdate(
      { email },
      {
        $set: {
          'notifications.comment': commentSetter,
          'notifications.reply': replySetter,
        },
      },
      { new: true, runValidators: true }
    );
  }
  async updateNotificationSetting({ email, notificateData }) {
    const bulkOperations = [];

    for (const key in notificateData) {
      const { canceled, sort, tab, groundId } = notificateData[key];

      // 업데이트 작업을 bulkOperations 배열에 추가
      if (canceled) {
        // "canceled:true"인 경우 notifications.content 배열에서 해당 ground를 삭제
        bulkOperations.push({
          updateOne: {
            filter: { email, 'notifications.content.ground': groundId },
            update: {
              $pull: { 'notifications.content': { ground: groundId } },
            },
          },
        });
      } else {
        // sort와 tab이 존재하는 경우 해당 ground의 notifications.content 요소를 업데이트
        bulkOperations.push({
          updateOne: {
            filter: { email, 'notifications.content.ground': groundId },
            update: {
              $set: {
                'notifications.content.$[elem].sort': sort,
                'notifications.content.$[elem].tab': tab,
              },
            },
            // 배열 필터를 이용해 ground가 일치하는 요소만 업데이트
            arrayFilters: [{ 'elem.ground': groundId }],
          },
        });
      }
    }
    // bulkWrite 실행: 여러 업데이트 작업을 한 번에 적용
    await User.bulkWrite(bulkOperations, { runValidators: true });
  }
}

const userModel = new UserModel();

export { userModel };
