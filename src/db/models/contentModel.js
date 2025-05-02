import { model } from 'mongoose';
import { ContentSchema } from '../schemas/contentSchema.js';

const Content = model('contents', ContentSchema);

class ContentModel {
  async create(contentInfo) {
    return await Content.create(contentInfo);
  }
  async findByGrounds(groundList) {
    return await Content.aggregate([
      { $match: { ground: { $in: groundList } } },
      {
        $lookup: {
          from: 'grounds',
          localField: 'ground',
          foreignField: '_id',
          as: 'groundData',
        },
      },
      { $unwind: '$groundData' },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$groundData.id',
          posts: {
            $push: {
              title: '$title',
              url: '$url',
              updatedAt: '$updatedAt',
              groundId: '$groundData.id',
            },
          },
        },
      },
      { $project: { posts: { $slice: ['$posts', 10] } } },
    ]);
  }
  async findByTitle(title) {
    return await Content.findOne({ title });
  }
  async findByContentUrl(url) {
    return await Content.findOne({ url })
      .populate({
        path: 'ground',
        select: { _id: 0 },
      })
      .populate({ path: 'author', select: { password: 0 } });
  }
  async getContentCountByGround(groundId, category) {
    const findOption =
      category === '전체'
        ? { ground: groundId }
        : { ground: groundId, tab: category };
    return await Content.find(findOption).count();
  }
  //pagination
  async getPaging(groundId, category, page, count) {
    const itemsPerPage = 20;
    if (count <= itemsPerPage) {
      page = 1;
    }
    const matchOption =
      category === '전체'
        ? { ground: groundId }
        : { ground: groundId, tab: category };
    const items = await Content.aggregate([
      { $sort: { createdAt: -1 } },
      { $match: matchOption },
      { $skip: (page - 1) * itemsPerPage },
      { $limit: itemsPerPage },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo',
        },
      },
      {
        $lookup: {
          from: 'grounds',
          localField: 'ground',
          foreignField: '_id',
          as: 'groundInfo',
        },
      },
    ]);

    return items;
    // return await Content.find({ _id: {$lt:}, ground: groundId }, { _id: 0 })
    //   .populate({ path: 'ground', select: { _id: 0 } })
    //   .populate({ path: 'author', select: { _id: 0 } });
  }
  async findCommentRecipient(content) {
    return await Content.aggregate([
      { $match: { _id: content } },
      {
        $lookup: {
          from: 'users',
          let: { authorId: '$author' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$authorId'] },
                    { $eq: ['$notifications.comment', true] },
                  ],
                },
              },
            },
          ],
          as: 'authorInfo',
        },
      },
      //authorInfo가 빈 배열이 아닌 경우. $ne: not equal
      { $match: { authorInfo: { $ne: [] } } },
    ]);
  }
}

const contentModel = new ContentModel();

export { contentModel };
