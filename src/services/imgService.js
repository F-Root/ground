import { imgModel } from '../db/index.js';

class ImgService {
  constructor(imgModel) {
    this.imgModel = imgModel;
  }

  async addImgInfo({ imgname, imgUrl }) {
    const imgInfo = await this.imgModel.create({ imgname, imgUrl });
    return imgInfo._id;
  }

  async updateImgInfo({ _id, imgname, imgUrl }) {
    const imgInfo = await this.imgModel.updateImgInfo({ _id, imgname, imgUrl });
    return imgInfo._id;
  }

  async getAllImgSASUrl() {
    return await this.imgModel.findAllSASUrl();
  }
}

const imgService = new ImgService(imgModel);

export { imgService };
