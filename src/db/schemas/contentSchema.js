import { Schema } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { numbers } from 'nanoid-dictionary';

const ContentSchema = new Schema(
  {
    url: {
      type: String,
      default: () => {
        return customAlphabet(numbers, 10)();
      },
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    tab: {
      type: String,
      required: true,
    },
    content: {
      type: Object,
      required: true,
    },
    ground: {
      type: Schema.Types.ObjectId,
      ref: 'grounds',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    view: {
      type: Number,
      default: 0,
    },
    rate: {
      type: [Schema.Types.ObjectId],
      ref: 'users',
      default: [],
    },
  },
  {
    collection: 'contents',
    timestamps: true,
  }
);

export { ContentSchema };
