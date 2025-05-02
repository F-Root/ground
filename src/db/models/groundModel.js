import { model } from 'mongoose';
import { GroundSchema } from '../schemas/groundSchema.js';

const Ground = model('grounds', GroundSchema);

class GroundModel {
  async create(groundInfo) {
    return await Ground.create(groundInfo);
  }
  async findAllGrounds() {
    return await Ground.find({}, { _id: 0, name: 1, id: 1 });
  }
  async findByGroundIds(ids) {
    // return await Ground.find({ id: { $in: ids } }, { _id: 1 });
    // ids 배열 인덱스의 순서에 맞춰서 데이터 반환하도록 수정
    return await Ground.aggregate([
      { $match: { id: { $in: ids } } },
      { $addFields: { order: { $indexOfArray: [ids, '$id'] } } },
      { $sort: { order: 1 } },
      { $project: { _id: 1, id: 1 } },
    ]);
  }
  async findByGroundName(name) {
    return await Ground.findOne({ name }, { _id: 0 });
  }
  async findByGroundId(id) {
    return await Ground.findOne({ id })
      .populate({
        path: 'manager',
        select: { _id: 0, email: 1, nickname: 1 },
      })
      .populate({ path: 'img', select: { _id: 0, imgUrl: 1 } });
  }
  async findByGroundManager(manager) {
    return await Ground.find({ manager }, { _id: 0, name: 1, id: 1 });
  }
  async findByKeywordRegexp(regexp) {
    return await Ground.find(
      {
        $or: [
          { name_jamo: { $regex: regexp } },
          { description_jamo: { $regex: regexp } },
        ],
      },
      { _id: 0, name: 1, id: 1 }
    ).populate({ path: 'img', select: { _id: 0, imgUrl: 1 } });
    // return await Ground.aggregate([
    //   {
    //     $match: {
    //       $expr: {
    //         $or: [
    //           {
    //             $regexMatch: {
    //               input: '$name_jamo',
    //               regex: regexp,
    //             },
    //           },
    //           {
    //             $regexMatch: {
    //               input: '$description_jamo',
    //               regex: regexp,
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   },
    // ]);
  }
  async findGroundNameAndManager({ _id, email }) {
    return await Ground.findOne({ _id, email }, { _id: 0, name: 1 }).populate({
      path: 'manager',
      select: { _id: 0, nickname: 1 },
    });
  }
  async findImgId({ id, name }) {
    const { img: _id } = await Ground.findOne({ id, name }, { _id: 0, img: 1 });
    return { _id };
  }
  async updateImg({ id, name, img }) {
    return await Ground.findOneAndUpdate(
      { id, name },
      { img },
      { new: true, runValidators: true }
    );
  }
  async updateManager({ id, name, manager }) {
    return await Ground.findOneAndUpdate(
      { id, name },
      { manager },
      { new: true, runValidators: true }
    );
  }
  async updateDescription({ id, name, description }) {
    return await Ground.findOneAndUpdate(
      { id, name },
      { description },
      { new: true, runValidators: true }
    );
  }
  async updateTab({ id, name, tab }) {
    return await Ground.findOneAndUpdate(
      { id, name },
      { tab },
      { new: true, runValidators: true }
    );
  }
  async updateRate({ id, name, rate }) {
    return await Ground.findOneAndUpdate(
      { id, name },
      { rate },
      { new: true, runValidators: true }
    );
  }
}

const groundModel = new GroundModel();

export { groundModel };
