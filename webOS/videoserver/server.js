const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 정적 파일 경로 설정 (HTML 파일 위치)
app.use(express.static(path.join(__dirname, './public')));

// `/camera` 경로에서 HTML 파일 제공
app.get('/camera', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'camera.html'));
});

// WebSocket 연결 처리
wss.on('connection', (ws) => {
    console.log('WebSocket 연결됨.');

    ws.on('message', (message, isBinary) => {
        console.log('프레임 전송 중...');

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                // 바이너리 데이터를 전송
                client.send(message, { binary: isBinary });
            }
        });
    });

    ws.on('error', (err) => {
        console.error(`WebSocket 오류 발생: ${err.message}`);
    });

    ws.on('close', () => console.log('WebSocket 연결 종료됨.'));
});

// 서버 시작
server.listen(4000, () => {
    console.log('서버가 http://localhost:4000 에서 실행 중...');
});