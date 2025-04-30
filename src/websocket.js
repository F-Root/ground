import { WebSocketServer } from 'ws';
import {
  jwtUtil,
  commentNotificationEmitter,
  replyNotificationEmitter,
  contentNotificationEmitter,
} from './utils/index.js';
import * as cookie from 'cookie';
import * as cookieSignature from 'cookie-signature';
import { tokenService, notificateService } from './services/index.js';

const cookieName = process.env.COOKIE_NAME;
const SECRET = process.env.COOKIE_SECRET;
const clients = new Map(); // 클라이언트 정보를 저장할 변수

// signed cookie verifying
function unsignCookie(signedCookie) {
  if (typeof signedCookie === 'string' && signedCookie.startsWith('s:')) {
    const unsigned = cookieSignature.unsign(signedCookie.slice(2), SECRET);
    return unsigned || null;
  }
  return signedCookie;
}

/*
 * HTTP 서버 인스턴스를 받아 해당 서버에 웹소켓을 설정
 * @param {http.Server} server - Express 앱에서 반환된 HTTP 서버 인스턴스
 * @returns {WebSocketServer} 생성된 웹소켓 서버 인스턴스
 */
export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    console.log(
      '\x1b[33m%s',
      '=========== 클라이언트가 연결되었습니다. ==========='
    );
    let userId;
    try {
      // 쿠키 파싱
      const cookies = cookie.parse(req.headers.cookie || '');
      const rawCookie = cookies[cookieName] ?? '';
      // 서명 검증: 쿠키 값에 "s:" 접두사가 있다면 unsign(인증)처리 해야함.
      const accessToken = unsignCookie(rawCookie);
      if (!accessToken) {
        throw new Error('Invalid or missing token in cookie.');
      }
      console.log('\x1b[32m%s', '---- 토큰 체킹 ----', accessToken);
      // 토큰 검증
      // verify access token
      const verifiedToken = jwtUtil.verifyAccess(accessToken);
      userId = await getCurrentUserId(verifiedToken);
      // 유저(클라이언트)정보 저장
      clients.set(userId, ws);
      // 클라이언트 확인
      console.log(
        '\x1b[32m%s',
        '--------클라이언트 체킹--------',
        clients.keys()
      );
    } catch (err) {
      console.error(err);
      if (err.message === 'EXPIRED_ACCESS_TOKEN_ERROR') {
        return ws.close(4000, 'renew-cookie-needed');
      }
      return ws.close(4000, err.message);
    }
    // 유저가 읽지 않은 모든 알림 broadcasting
    setInterval(async () => {
      // 읽지 않은 모든 알림 데이터 가져오기 -> X
      // from 현재시각 - interval시각 ~ 현재시각 사이에 created된 알람 데이터 get.
      const notifications =
        (await notificateService.getAllNotificationsByUser(userId)) ?? [];
      const notificationlist = notifications.map((notification) => {
        if (notification.type === 'content') {
          const {
            type,
            creator: { nickname },
            sourceDoc: {
              title,
              url,
              groundDoc: { name, id },
            },
          } = notification;
          return { type, nickname, title, name, id, url };
        } else {
          const {
            type,
            creator: { nickname },
            sourceDoc: {
              url: commentUrl,
              contentDoc: {
                title,
                url,
                groundDoc: { name, id },
              },
            },
          } = notification;
          return { type, nickname, title, name, id, url, commentUrl };
        }
      });
      // console.log('notificationlist:', notificationlist);
      // 연결 상태 확인 후 데이터 전송
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(notificationlist));
      }
    }, 1000); //초마다 작동

    // 연결 유지
    ws.on('message', (data) => {
      const message = data.toString('utf8');
      console.log('메시지:', message);
      if (message === 'ping') {
        ws.send('pong');
      }
    });

    ws.on('close', () => {
      // 연결 종료 시 clients 맵에서 userId 제거
      for (const [userId, clientWs] of clients.entries()) {
        if (clientWs === ws) {
          clients.delete(userId);
          console.log(`사용자 ${userId} 연결 종료`);
          break;
        }
      }
    });
  });

  return wss;
}

const getCurrentUserId = async (verifiedToken) => {
  return await tokenService.getUserId(verifiedToken);
};

/* 이벤트 구독: 새로운 알림이 발생하면 해당 사용자의 WebSocket에 메시지 전송 */

/*
 *  Websocket event listener는 사용하지 않음.
 *
 *  알람을 게시물이 생성되는 그 순간 딱 한번만 전송하기 때문.
 *  읽지 않은 알람은 지속적으로 송신해야하기 때문에 사용하지 않기로 결정.
 */

// 게시물
// contentNotificationEmitter.on(
//   'newContent',
//   (userId, content, groundName, creator) => {
//     // 클라이언트 확인
//     console.log('\x1b[32m%s', '-------클라이언트 확인--------', clients);
//     const ws = clients.get(userId);
//     const { title } = content;
//     console.log('ws가없나:', ws);
//     if (ws && ws.readyState === ws.OPEN) {
//       ws.send(JSON.stringify({ groundName, creator, title }));
//     }
//   }
// );

// 댓글
// commentNotificationEmitter.on('newComment', (userId, notification) => {
//   const ws = clients.get(userId);
// });

// 답글
