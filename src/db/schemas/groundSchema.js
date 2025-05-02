import { Schema } from 'mongoose';
import { Hangul } from '../../utils/hangul.js';

const GroundSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    img: {
      type: Schema.Types.ObjectId,
      ref: 'imgs',
    },
    description: {
      type: String,
      require: true,
    },
    id: { type: String, require: true, unique: true },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    tab: {
      type: [String],
      required: true,
      default: ['전체'],
    },
    //추천 수
    rate: {
      type: Number,
      required: true,
      default: 15,
    },
    // 검색 기능을 위한 자음,모음을 분해해서 저장해놓은 필드
    name_jamo: String,
    description_jamo: String,
  },
  {
    collection: 'grounds',
    timestamps: true,
  }
);

GroundSchema.pre('save', function (next) {
  this.name_jamo = Hangul.toString(this.name);
  this.description_jamo = Hangul.toString(this.description);
  next();
});

GroundSchema.pre('findOneAndUpdate', function (next) {
  // 업데이트 데이터
  const update = this.getUpdate();
  // $set이 없으면 생성
  const set = update.$set || (update.$set = {});
  if (set.description != null) {
    // description이 변경될 때만 jamo 재생성
    set.description_jamo = Hangul.toString(set.description);
  }
  next();
});

export { GroundSchema };
