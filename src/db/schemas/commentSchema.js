import { Schema } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';

const CommentSchema = new Schema(
  {
    url: {
      type: String,
      default: () => {
        return customAlphabet(alphanumeric, 12)();
      },
      required: true,
      unique: true,
    },
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    content: {
      type: Schema.Types.ObjectId,
      ref: 'contents',
      required: true,
    },
    replyIn: {
      type: Schema.Types.ObjectId,
      ref: 'comments',
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'comments',
    },
    mention: {
      type: String,
    },
  },
  {
    collection: 'comments',
    timestamps: true,
  }
);

export { CommentSchema };
