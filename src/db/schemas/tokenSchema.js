import { Schema } from 'mongoose';

const TokenSchema = new Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hashedEmail: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'tokens',
    timestamps: true,
  }
);

export { TokenSchema };
