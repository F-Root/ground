import { Schema } from 'mongoose';

/*
 * user - 알림 수신자
 * type - 알림 유형(어떤 알림인지 content인지 comment인지)
 * sourceId - 이벤트 발생 대상(게시글, 댓글, 답글)의 ID.
 * isRead - 읽음 여부
 */

const NotificateSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    type: {
      type: String,
      enum: ['content', 'comment', 'reply'],
      required: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      refPath: 'sourceModel',
      required: true,
    },
    sourceModel: {
      type: String,
      enum: ['contents', 'comments'],
      required: true,
    },
    creator: {
      id: { type: Schema.Types.ObjectId, required: true },
      nickname: { type: String, required: true },
    },
    isRead: { type: Boolean, default: false },
    // send: { type: Boolean, default: false },
  },
  { collection: 'notificates', timestamps: true }
);
// TTL 인덱스 생성: 1일 - 초 단위
const expiresIn = 60 * 60 * 24;
NotificateSchema.index({ createdAt: 1 }, { expireAfterSeconds: expiresIn });

export { NotificateSchema };
