/* MS azure & multer */
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import 'dotenv/config';
import multer from 'multer';
import fetch from 'node-fetch';
import { AppError } from '../middlewares/index.js';
import { imgService } from '../services/index.js';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER;
if (!accountName) throw Error('Azure Storage accountName 을 찾을 수 없습니다.');

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
);

// 컨테이너 클라이언트를 가져오고, 없으면 생성.
async function getContainerClient() {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const exists = await containerClient.exists();
  if (!exists) {
    // 공개 읽기 액세스(이미지 보기용)로 컨테이너 생성.
    await containerClient.create();
    console.log(`컨테이너 ${containerName}이(가) 생성되었습니다.`);
  }
  return containerClient;
}

// 이미지를 업로드하는 함수
async function uploadImage(blobName, buffer) {
  const containerClient = await getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadResponse = await blockBlobClient.uploadData(buffer, {
    overwrite: true,
  });
  console.log(
    `Blob "${blobName}" 업로드 성공 (requestId: ${uploadResponse.requestId})`
  );
  return uploadResponse;
}

// 이미지를 다운로드하는 함수 (Buffer 반환)
async function downloadImage(blobName) {
  const containerClient = await getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download(0);
  const downloadedBuffer = await streamToBuffer(
    downloadResponse.readableStreamBody
  );
  return downloadedBuffer;
}

// 스트림을 버퍼로 변환하는 헬퍼 함수
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

/*
 * 관리형 ID를 사용하여 User Delegation SAS 토큰 생성 함수
 * @param {string} blobName - SAS를 생성할 Blob의 이름
 * @param {string} permissionsStr - SAS에 부여할 권한 (예: "r"는 읽기 권한)
 * @param {number} validHours - SAS 토큰의 유효 시간(시간 단위)
 * @returns {Promise<string>} - 생성된 SAS 토큰 (쿼리 문자열 형태)
 */
async function generateUserDelegationSAS(
  blobName,
  permissionsStr = 'r',
  validDate = 6
  // validSecond = 6
) {
  // SAS 토큰의 시작 시간과 만료 시간을 설정합니다.
  const startsOn = new Date();
  const expiresOn = new Date();
  expiresOn.setDate(expiresOn.getDate() + validDate);
  // expiresOn.setSeconds(expiresOn.getSeconds() + validSecond); // ->6초(테스트용)

  console.log('containerName:', containerName);
  console.log('blobName:', blobName);
  console.log('startsOn:', startsOn);
  console.log('expiresOn:', expiresOn);

  // 관리형 ID를 통한 인증으로 User Delegation Key 획득
  const userDelegationKey = await blobServiceClient.getUserDelegationKey(
    startsOn,
    expiresOn
  );

  // Blob에 부여할 권한 설정 (예: "r" - 읽기)
  const permissions = BlobSASPermissions.parse(permissionsStr);

  // SAS 토큰 옵션 설정: 읽기 권한, inline으로 이미지 표시, 적절한 contentType 지정 (image/jpeg)
  const sasOptions = {
    containerName,
    blobName,
    permissions: permissions, // 읽기 권한
    startsOn,
    expiresOn,
    contentDisposition: 'inline', // 브라우저에서 바로 표시
    contentType: 'image/jpeg', // 이미지의 MIME 타입 (필요에 따라 변경)
  };

  // 관리형 ID(사용자 위임 키)를 사용하여 SAS 토큰 생성
  // 여기서는 accountName이 필요하며, userDelegationKey를 사용합니다.
  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    userDelegationKey,
    accountName
  ).toString();

  return sasToken;
}

// 이미지 SAS URL을 받아오는 함수
async function getBlobSASUrl(blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  // User Delegation SAS 토큰 생성 (6일 유효, 읽기 권한)
  // https://learn.microsoft.com/ko-kr/rest/api/storageservices/get-user-delegation-key#request-body - 현재 날짜의 7일 이내에 유효한 날짜. 7일을 벗어나면 에러 발생.
  const sasToken = await generateUserDelegationSAS(blobName, 'r', 6);

  // Blob URL과 SAS 토큰 결합
  return `${blobClient.url}?${sasToken}`;
}

// multer setting (for multipart/form-data)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(
        new AppError('Upload Error', '이미지 파일만 업로드 가능합니다.', '500')
      );
    }
    cb(null, true);
  },
});

// 이미지 업로드 후 SAS URL 반환
async function getImgSASUrl(img) {
  // 깨진 originalname을 UTF-8로 재인코딩 (파일명이 한글일 경우 깨짐)
  const imgname = Buffer.from(img.originalname, 'latin1').toString('utf-8');
  console.log('이미지:', img);
  console.log('이미지이름:', imgname);

  try {
    await uploadImage(imgname, img.buffer);
    const imgUrl = await getSASUrl(imgname);
    console.log('이미지Url:', imgUrl);
    return { imgname, imgUrl };
  } catch (error) {
    throw new AppError(error.name, error.message);
  }
}

// SAS URL 생성 후 반환
async function getSASUrl(imgname) {
  try {
    return await getBlobSASUrl(imgname);
  } catch (error) {
    if (
      error.name.includes('RestError') &&
      error.message.includes(
        'The value for one of the XML nodes is not in the correct format.'
      )
    ) {
      // 예기치 못한 오류를 해결하기 위한 재귀적 호출
      console.error(error);
      return await getSASUrl();
    }
    console.error(error);
    throw new AppError(error.name, error.message);
  }
}

// 이미지 SAS URL 확인
async function checkSASUrlValidity(sasUrl) {
  try {
    const response = await fetch(sasUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('SAS URL 요청 오류:', error);
    return false;
  }
}

// 만료되었으면 갱신
async function refreshSASUrl() {
  try {
    const allImgs = await imgService.getAllImgSASUrl();
    allImgs.forEach(async ({ _id, imgname, imgUrl }) => {
      if (!(await checkSASUrlValidity(imgUrl))) {
        imgUrl = await getSASUrl(imgname);
        const result = await imgService.updateImgInfo({
          _id,
          imgname,
          imgUrl,
        });
        console.log('업데이트 결과:', result);
      }
    });
  } catch (error) {
    console.error('SAS url 에러발생:', error);
  }
}

// 서버 실행 시 모든 SAS URL의 유효성 확인
refreshSASUrl();
// 하루 간격으로 모든 SAS URL의 유효성 확인
// check img SAS URL validity per 1 day
setInterval(refreshSASUrl, 1000 * 60 * 60 * 24);
// setInterval(refreshSASUrl, 1000 * 6); // ->6초(테스트용)

export { downloadImage, upload, getImgSASUrl };
