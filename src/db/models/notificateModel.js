import { model } from 'mongoose';
import { NotificateSchema } from '../schemas/notificateSchema.js';

const Notificate = model('notificates', NotificateSchema);

class NotificateModel {
  async create(notifications) {
    return await Notificate.insertMany(notifications, { runValidators: true });
  }
  async findByUserId(user) {
    return await Notificate.aggregate([
      { $match: { user, isRead: false } },
      // 1. 'contents' branch: sourceModel이 'contents'인 경우
      {
        $lookup: {
          from: 'contents', // 실제 컬렉션 이름이 'contents'
          let: { sourceId: '$sourceId', modelType: '$sourceModel' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$sourceId'] },
                    { $eq: ['$$modelType', 'contents'] },
                  ],
                },
              },
            },
            // contents 문서 내의 ground 필드로 ground 컬렉션과 join
            {
              $lookup: {
                from: 'grounds', // ground 스키마를 가진 컬렉션
                localField: 'ground',
                foreignField: '_id',
                as: 'groundDoc',
              },
            },
            {
              $unwind: {
                path: '$groundDoc',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'contentsDoc',
        },
      },
      // 2. 'comments' branch: sourceModel이 'comments'인 경우
      {
        $lookup: {
          from: 'comments',
          let: { sourceId: '$sourceId', modelType: '$sourceModel' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$sourceId'] },
                    { $eq: ['$$modelType', 'comments'] },
                  ],
                },
              },
            },
            // comments 문서 내의 content 필드로 contents 컬렉션과 join
            {
              $lookup: {
                from: 'contents',
                localField: 'content',
                foreignField: '_id',
                as: 'contentDoc',
              },
            },
            {
              $unwind: {
                path: '$contentDoc',
                preserveNullAndEmptyArrays: true,
              },
            },
            // join한 contents 문서 내의 ground 필드를 사용하여 grounds 컬렉션과 join
            {
              $lookup: {
                from: 'grounds',
                localField: 'contentDoc.ground', // join된 contents 문서의 ground 필드
                foreignField: '_id',
                as: 'contentDoc.groundDoc',
              },
            },
            {
              $unwind: {
                path: '$contentDoc.groundDoc',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'commentsDoc',
        },
      },
      // 3. notificate의 sourceModel값에 따라 올바른 lookup 결과를 선택하여 추가
      {
        $addFields: {
          sourceDoc: {
            $cond: [
              { $eq: ['$sourceModel', 'contents'] },
              { $arrayElemAt: ['$contentsDoc', 0] },
              { $arrayElemAt: ['$commentsDoc', 0] },
            ],
          },
        },
      },
      // 4. 임시 lookup 결과 필드 삭제
      {
        $project: {
          contentsDoc: 0,
          commentsDoc: 0,
        },
      },
    ]);
    // const now = new Date();
    // const tenSecondsAgo = new Date(now.getTime() - 10 * 1000);
    // return await Notificate.find({
    //   user,
    //   isRead: false,
    //   // createdAt: { $gte: tenSecondsAgo, $lte: now },
    //   // send: false,
    // })
    //   .populate({
    //     path: 'sourceId',
    //     // select: { _id: 0, title: 1 },
    //     populate: {
    //       path: 'ground',
    //       select: { _id: 0, name: 1, id: 1 },
    //     },
    //     // populate: [
    //     //   { path: 'ground', select: { _id: 0, name: 1, id: 1 } },
    //     //   { path: 'content', select: { _id: 0, title: 1, url: 1 } },
    //     // ],
    //   })
    //   .sort({ createdAt: -1 })
    //   .limit(10);
  }
  // async updateSent(notifications) {
  //   return await Notificate.updateMany(
  //     { _id: { $in: notifications } },
  //     { $set: { send: true } }
  //   );
  // }
  async updateAllRead({ user }) {
    return await Notificate.updateMany({ user }, { $set: { isRead: true } });
  }
  async updateContentRead({ user, url }) {
    return await Notificate.aggregate([
      { $match: { user } },
      {
        $lookup: {
          from: 'contents',
          localField: 'sourceId',
          foreignField: '_id',
          as: 'sourceInfo',
        },
      },
      { $match: { sourceInfo: { $elemMatch: { url } } } },
      { $set: { isRead: true } },
      // sourceInfo 필드를 제거 ($unset 혹은 $project 사용)
      { $unset: 'sourceInfo' }, // { $project: { sourceInfo: 0 } },
      {
        $merge: {
          into: 'notificates',
          on: '_id',
          whenMatched: 'merge',
          whenNotMatched: 'discard',
        },
      },
    ]);
  }
  async updateCommentRead({ user, url }) {
    return await Notificate.aggregate([
      { $match: { user } },
      {
        $lookup: {
          from: 'comments',
          localField: 'sourceId',
          foreignField: '_id',
          as: 'sourceInfo',
        },
      },
      { $match: { sourceInfo: { $elemMatch: { url } } } },
      { $set: { isRead: true } },
      // sourceInfo 필드를 제거
      { $unset: 'sourceInfo' },
      // { $project: { sourceInfo: 0 } },
      {
        $merge: {
          into: 'notificates',
          on: '_id',
          whenMatched: 'merge',
          whenNotMatched: 'discard',
        },
      },
    ]);
  }
}

const notificateModel = new NotificateModel();

export { notificateModel };
