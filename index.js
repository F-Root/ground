import 'dotenv/config';
import { app } from './src/app.js';
import { setupWebSocket } from './src/websocket.js';

const PORT = process.env.SERVER_PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`정상적으로 서버를 시작하였습니다.  http://localhost:${PORT}`);
});

// websocket
setupWebSocket(server);
