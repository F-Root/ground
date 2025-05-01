import mongoose from 'mongoose';

const DB_URL =
  process.env.MONGODB_URL ||
  '❌ MongoDB 서버 주소가 설정되지 않았습니다.\n1)./db/index.js 파일 확인\n2).env 파일 세팅 확인\n';

mongoose.connect(DB_URL, { dbName: 'ground' });
const mongodb = mongoose.connection;

mongodb.on('connected', () =>
  console.log('✅ MongoDB 서버에 정상적으로 연결되었습니다:' + DB_URL)
);
mongodb.on('error', (error) =>
  console.error(
    '\n❌ MongoDB 연결에 실패하였습니다...\n' + DB_URL + '\n' + error
  )
);

mongodb.once('open', async () => {
  // await dropAllIndexes();
  await syncIfNeeded();
  await checkIndexes();
});

const dropAllIndexes = async () => {
  try {
    const collections = await mongodb.db.listCollections().toArray();
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🔴 인덱스 삭제 중: ${collectionName}`);
      await mongodb.collection(collectionName).dropIndexes();
    }
    console.log('✅ 모든 인덱스 삭제 완료');
  } catch (error) {
    console.error('❌ 인덱스 삭제 중 오류 발생:', error);
  }
};

const syncIfNeeded = async () => {
  try {
    const models = mongoose.models;
    console.log('📌 등록된 Mongoose 모델:', Object.keys(models));
    let needDropIndexes = false;

    for (const modelName in models) {
      const model = models[modelName];

      // 현재 DB와 Mongoose 모델의 인덱스 차이 확인
      const diff = await model.diffIndexes();

      if (
        Object.keys(diff.toCreate).length > 0 ||
        Object.keys(diff.toDrop).length > 0
      ) {
        console.log(`🔄 인덱스 변경 필요 (${modelName}):`, diff);
        await model.syncIndexes();
        console.log(`✅ 인덱스 동기화 완료: ${modelName}`);
        // needDropIndexes = true; // 인덱스 변경이 감지되면 dropAllIndexes() 실행 플래그 설정 -> syncIndexes()를 실행했으므로 dropAllIndexes()를 실행할 필요 없음.
      } else {
        console.log(`✅ 인덱스 변경 없음: ${modelName}`);
      }
    }

    // 🔴 기존 인덱스를 모두 삭제해야 하는 경우 실행
    if (needDropIndexes) {
      console.log(
        '⚠️ 기존 인덱스 삭제가 필요합니다. 삭제 후 다시 동기화합니다.'
      );
      await dropAllIndexes();
      console.log('🔄 다시 인덱스를 동기화합니다.');
      for (const modelName in models) {
        await models[modelName].syncIndexes();
      }
    }

    console.log('🎯 모든 모델의 인덱스 동기화 검토 완료');
  } catch (error) {
    console.error('❌ 인덱스 동기화 중 오류 발생:', error);
  }
};

const checkIndexes = async () => {
  try {
    const collections = await mongodb.db.listCollections().toArray();
    for (const collection of collections) {
      const indexes = await mongodb.db.collection(collection.name).indexes();
      console.log(`📌 ${collection.name} 인덱스 목록:`, indexes);
    }
  } catch (error) {
    console.error('❌ 인덱스 조회 중 오류 발생:', error);
  }
};

export * from './models/userModel.js';
export * from './models/tokenModel.js';
export * from './models/groundModel.js';
export * from './models/contentModel.js';
export * from './models/commentModel.js';
export * from './models/imgModel.js';
export * from './models/notificateModel.js';
