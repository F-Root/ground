import { Schema } from 'mongoose';

const ImgSchema = new Schema(
  {
    imgname: {
      type: String,
      require: true,
    },
    imgUrl: {
      type: String,
      require: true,
    },
  },
  {
    collection: 'imgs',
    timestamps: true,
  }
);

export { ImgSchema };

// ImgSchema.pre('findOneAndUpdate', async function (next) {
//   try {
//     const docToUpdate = await this.model.findOne(this.getQuery());
//     if (!docToUpdate) {
//       return next();
//     }
//     const update = this.getUpdate();
//     console.log('원래객체:', docToUpdate, '\n업데이트객체:', update);

//     this._isImgUpdated = docToUpdate.imgname === update.imgname;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });
// ImgSchema.post('findOneAndUpdate', async function (doc, next) {
//   if (!doc) {
//     return next();
//   }
//   // 이미지 업데이트 여부 반환
//   doc._isImgUpdated = this._isImgUpdated;
//   next();
// });
