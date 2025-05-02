import { Schema } from 'mongoose';

const TokenSchema = new Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'tokens',
    timestamps: true,
  }
);
// TTL 인덱스 생성: 7일 - 초 단위 (refresh token 기준)
const expiresIn = 60 * 60 * 24 * 7;
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: expiresIn });

export { TokenSchema };
