import crypto from 'crypto';
import mongoose from 'mongoose';

// .env 파일에서 SECRET_KEY를 불러옴
const secretKey = Buffer.from(process.env.TOKEN_ID_SECRET_KEY, 'utf8'); // 32바이트여야 함 (AES-256)
const algorithm = 'aes-256-gcm'; // GCM모드 적용 (CBC모드는 'aes-256-cbc')

// 암호화 함수
function encrypt(text) {
  const iv = crypto.randomBytes(12); // IV: 초기화 벡터 (12byte)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // 인증 태그 추출 (16바이트)
  const authTag = cipher.getAuthTag().toString('hex');
  // IV, 암호문, 인증 태그를 합쳐서 반환
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: authTag,
  };
}

// 복호화 함수
function decrypt(encrypted) {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const tag = Buffer.from(encrypted.tag, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  // 복호화 전에 반드시 태그 설정
  decipher.setAuthTag(tag);
  // 복호화
  let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 사용 예제
// const objectId = '507f1f77bcf86cd799439011'; // 예시 ObjectId
// const encrypted = encrypt(objectId);
// console.log('Encrypted:', encrypted);
// const decrypted = decrypt(encrypted);
// console.log('Decrypted:', decrypted);

function encryptObjId(objectId) {
  // Object Id -> JSON
  const jsonId = JSON.stringify(objectId);
  const encrypted = encrypt(jsonId);
  return encrypted;
}

function decryptObjId(encrypted) {
  const jsonId = decrypt(encrypted).replace(/^"|"$/g, ''); // 쌍따옴표 없애기
  // JSON -> Object Id
  const objectId = new mongoose.Types.ObjectId(jsonId);
  return objectId;
}

export { encryptObjId, decryptObjId };
