import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();
import 'dotenv/config';
import { AppError } from '../middlewares/index.js';
import { imgModel } from '../db/index.js';

async function authMailer(email, authNumber) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
      user: process.env.MAILER_ID,
      pass: process.env.MAILER_PW,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `GROUND Team <${process.env.MAILER_ID}>`,
      to: email,
      subject: '이메일 인증 번호입니다.',
      html: await mailForm(authNumber),
    });
    console.log(info);
  } catch (error) {
    console.log(error);
    throw new AppError('SendMailError', '메일 발송을 실패했습니다.', 500);
  }
}

const mailForm = async (authNumber) => {
  // Buffer를 이용해 Base64로 인코딩
  // const base64Svg = Buffer.from(icons.favicon).toString('base64');
  // 데이터 URI 형식으로 변환 (이후 <img> 태그 등에서 사용)
  // const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

  /* 위 방식들이 정상 작동하지 않음 */
  const { imgUrl } = await imgModel.findGroundIconSASUrl();
  return /* HTML */ `<table width="100%">
    <tbody>
      <tr align="center">
        <div
          style="border:1px solid lightgray;border-radius:10px;padding:40px 20px;max-width:450px;box-sizing:border-box;"
        >
          <div style="border-bottom:1px solid lightgray;text-align:center;">
            <img src="${imgUrl}" alt="favicon" width="55" height="55" />
            <h1>그라운드 이메일 인증코드 확인</h1>
          </div>
          <p style="font-size:14px;text-align:start;">
            다음 코드를 사용하여 이메일 인증을 완료하세요.
          </p>
          <p style="font-size:30px;font-weight:bold;text-align:center;">
            ${authNumber}
          </p>
          <p style="font-size:12px;text-align:start;">
            코드는 1분 후 만료됩니다.
          </p>
        </div>
      </tr>
    </tbody>
  </table>`;
};

export { authMailer };
