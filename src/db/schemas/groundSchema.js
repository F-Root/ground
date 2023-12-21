import { Schema } from 'mongoose';

const GroundSchema = new Schema(
  {
    groundName: {
      type: String,
      required: true,
      unique: true,
    },
    manager: {
      type: String,
      required: true,
    },
    subscriber: {
      type: Number,
      required: false,
      default: 0,
    },
    notice: {
      type: String,
      required: false,
      default: '',
    },
    tab: {
      type: String,
      required: true,
      default: '',
    },
  },
  {
    collection: 'grounds',
    timestamps: true,
  }
);

export { GroundSchema };
