import { Schema } from 'mongoose';

const notificationContentSchema = new Schema(
  {
    ground: {
      type: Schema.Types.ObjectId,
      ref: 'grounds',
      required: true,
    },
    sort: {
      type: [{ type: String, enum: ['best', 'all'] }],
      required: true,
      default: [],
    },
    tab: {
      type: [String],
      default: [],
    },
  },
  { _id: false } // _id 생성 필요없음.
);

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    nickname: {
      type: String,
      required: true,
    },
    img: {
      type: Schema.Types.ObjectId,
      ref: 'imgs',
    },
    role: {
      type: String,
      required: true,
      default: 'user',
    },
    // notificates, subscribes 필드에 Custom Setter사용
    // 같은 ground ObjectId가 저장되는 현상을 방지하기 위함.
    // notificates: [{ type: Schema.Types.ObjectId, ref: 'grounds' }],
    // 기존 notificates 필드를 grounds 프로퍼티로 변경.
    notifications: {
      comment: { type: Boolean, default: false }, // 댓글 알림 수신 여부
      reply: { type: Boolean, default: false }, // 답글 알림 수신 여부
      content: {
        type: [notificationContentSchema],
        default: [],
        set: function (values) {
          // 각 서브도큐먼트에서 ground 값을 문자열로 변환한 후 중복 제거
          const uniqueValues = [];
          const idSet = new Set();

          values.forEach((val) => {
            const groundId = val.ground.toString();
            // 중복된 ground는 추가하지 않음. 필요에 따라 sort별 중복을 고려할 수도 있음.
            if (!idSet.has(groundId)) {
              idSet.add(groundId);
              uniqueValues.push(val);
            }
          });
          return uniqueValues;
        },
      }, // 그라운드 게시글 알림 수신 여부
    },
    // subscribes: [{ type: Schema.Types.ObjectId, ref: 'grounds' }],
    subscribes: {
      type: [Schema.Types.ObjectId],
      ref: 'grounds',
      default: [],
      set: function (values) {
        // 각 값을 문자열로 변환 후 Set을 사용해 중복 제거
        const uniqueValues = [...new Set(values.map((val) => val.toString()))];
        // 필요에 따라 다시 ObjectId로 변환할 수도 있음
        return uniqueValues;
      },
    },
    /* 프로필 업데이트 전용 */
    // 마지막 업데이트 이후 30일이 지났는지 확인하기 위해
    // 자동으로 생성되는 updatedAt 대신 개별 관리하는 필드 사용
    profileUpdatedAt: { type: Date },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

// UserSchema.pre('findOneAndUpdate', async function (next) {
//   try {
//     // 현재 쿼리 필터를 통해 업데이트 대상 문서를 가져옴.
//     const docToUpdate = await this.model.findOne(this.getQuery());
//     if (!docToUpdate) {
//       return next();
//     }
//     // 업데이트 데이터 객체를 가져옴. (필드에 저장된 기존 데이터가 아닌 클라이언트에서 보낸 데이터)
//     const update = this.getUpdate();
//     // 오리지날 데이터를 백업 (post hook에서 사용) -> structuredClone : 깊은 복사
//     // this._originalUpdate = structuredClone(update);

//     // update 객체에 nickname이 존재할 때만 실행
//     if (Object.hasOwn(update, 'nickname')) {
//       // 마지막 이미지 업데이트, 닉네임 업데이트 날짜
//       const { nicknameUpdatedAt } = docToUpdate;
//       // 30일
//       const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
//       // 마지막 업데이트로부터 지난 날짜
//       const timeSinceLastNicknameUpdate =
//         Date.now() - new Date(nicknameUpdatedAt).getTime();

//       // 30일이 안지났으면 업데이트 데이터를 기존 데이터로 덮어씌움.
//       if (timeSinceLastNicknameUpdate < THIRTY_DAYS_MS) {
//         update.nickname = docToUpdate.nickname;
//         this._isNicknameUpdated = false;
//         // 업데이트할 데이터 객체를 덮어씌움.
//         this.setUpdate(update);
//         return next();
//       }
//       // updatedAt 날짜 설정
//       update.$set.nicknameUpdatedAt = new Date();
//       this._isNicknameUpdated = true;
//       // 업데이트할 데이터 객체를 덮어씌움.
//       this.setUpdate(update);
//       next();
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// UserSchema.post('findOneAndUpdate', async function (doc, next) {
//   if (!doc) {
//     return next();
//   }
//   // 닉네임 업데이트 여부 반환
//   doc._isNicknameUpdated = this._isNicknameUpdated;
//   next();
// });

export { UserSchema };
