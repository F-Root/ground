import { model } from 'mongoose';
import { ImgSchema } from '../schemas/imgSchema.js';

const Img = model('imgs', ImgSchema);

class ImgModel {
  async create({ imgname, imgUrl }) {
    return await Img.create({ imgname, imgUrl });
  }
  async updateImgInfo({ _id, imgname, imgUrl }) {
    return await Img.findOneAndUpdate(
      { _id },
      { imgname, imgUrl },
      { new: true, runValidators: true }
    );
  }
  async findAllSASUrl() {
    return await Img.find();
  }
  async findGroundIconSASUrl() {
    return await Img.findOne(
      { imgname: 'ground_icon.png' },
      { _id: 0, imgUrl: 1 }
    );
  }
}

const imgModel = new ImgModel();

export { imgModel };
