import mongoose from 'mongoose';

const DB_URL =
  process.env.MONGODB_URL ||
  'MongoDB 서버 주소가 설정되지 않았습니다.\n1)./db/index.js 파일 확인\n2).env 파일 세팅 확인\n';

mongoose.connect(DB_URL, { dbName: 'ground' });
const db = mongoose.connection;

db.on('connected', () =>
  console.log('정상적으로 MongoDB 서버에 연결되었습니다.' + DB_URL)
);
db.on('error', (error) =>
  console.error('\nMongoDB 연결에 실패하였습니다...\n' + DB_URL + '\n' + error)
);

export * from './models/userModel.js';
