const pkgInfo = require('./package.json');
const Service = require('webos-service');
const express = require('express');
const expressWs = require('express-ws');
const WebSocket = require('ws');  // ROSBridge 연결을 위해 ws 사용

// 서비스 초기화
const service = new Service(pkgInfo.name);
const logHeader = "[" + pkgInfo.name + "]";
let channelId;
let deviceAddress = "98:DA:60:0A:92:DF";

const app = express();
expressWs(app); // express-ws로 WebSocket 서버 설정
const port = 3000;

// ROSBridge WebSocket 연결
let rosBridge;
const connectToRosBridge = () => {
    rosBridge = new WebSocket('ws://192.168.183.96:9090'); // 여기에 ROSBridge 주소를 넣습니다.

    rosBridge.on('open', () => {
        console.log('ROSBridge 연결됨');
    });

    rosBridge.on('message', (data) => {
        console.log('RosBridge로부터 데이터 수신:', data);
    });

    rosBridge.on('error', (error) => {
        console.error(`ROSBridge WebSocket 에러: ${error}`);
    });

    rosBridge.on('close', () => {
        console.warn('ROSBridge 연결 끊김. 재연결 시도...');
        setTimeout(connectToRosBridge, 5000); // 재연결 시도
    });
};

// 처음에 ROSBridge에 연결 시도
connectToRosBridge();

app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
});

// WebSocket 연결
app.ws('/', function(ws, req) {
    console.log('client connected.');
    ws.on('message', handleMessage);
});

// 메시지 처리 함수
const handleMessage = (message) => {
    console.log('수신된 메시지: ', message);
    let msg;
    try {
        msg = JSON.parse(message);
        console.log('파싱된 메시지: ', msg); // 파싱된 메시지 확인
    } catch (error) {
        console.error('메시지 파싱 오류:', error);
        return;
    }

    if (msg.direction) {
        console.log('direction 명령어:', msg.direction); // direction 값 확인
        sendCommand(msg.direction);  // 클라이언트에서 받은 방향값을 그대로 전송
    }

    if (msg.command) {
        console.log('command 명령어:', msg.command); // command 값 확인
        sendCommand(msg.command); // 명령 처리
    }
};


// ************************* /cmd_vel 전달  *****************************//
/*const sendCmdVel = (linearX, angularZ) => {
    const rosMessage = JSON.stringify({
        op: 'publish',
        topic: '/cmd_vel',
        msg: {
            linear: { x: linearX, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: angularZ },
        },
    });

    if (rosBridge.readyState === WebSocket.OPEN) {
        rosBridge.send(rosMessage);
        console.log(`Sent /cmd_vel: ${rosMessage}`);
    } else {
        console.error('ROSBridge WebSocket 닫힘');
    }
};*/

// ************************* /turtlebot_command 전달  *****************************//
const sendCommand = (command) => {
    console.log(`전송할 명령어: ${command}`);  // 전달되는 command 값 확인
    const rosMessage = JSON.stringify({
        op: 'publish',
        topic: '/turtlebot_command',
        msg: { data: command },
    });

    if (rosBridge.readyState === WebSocket.OPEN) {
        rosBridge.send(rosMessage);
        console.log(`Sent command: ${rosMessage}`);  // 전송된 메시지 확인
    } else {
        console.error('ROSBridge WebSocket 닫힘');
    }
};
// ************************* 속도 업데이트 등록 *****************************//

//let currentLinearSpeed = 0;
//let currentAngularSpeed = 0;


/*service.register("updateSpeed", function(message) {
    const { direction } = message.payload;

    // 방향에 따라 속도 업데이트
    switch (direction) {
        case 'front':
            currentLinearSpeed = Math.min(currentLinearSpeed + 0.05, 1.0);
            break;
        case 'back':
            currentLinearSpeed = Math.max(currentLinearSpeed - 0.05, -1.0);
            break;
        case 'left':
            currentAngularSpeed = Math.min(currentAngularSpeed + 0.05, 1.0);
            break;
        case 'right':
            currentAngularSpeed = Math.max(currentAngularSpeed - 0.05, -1.0);
            break;
        case 'neutral':
            currentLinearSpeed = 0;
            currentAngularSpeed = 0;
            break;
        default:
            break;
    }

    console.log(`속도 업데이트: linearX=${currentLinearSpeed}, angularZ=${currentAngularSpeed}`);

    sendCmdVel(currentLinearSpeed, currentAngularSpeed);

    message.respond({
        returnValue: true,
        responseText: "Speed updated"
    });
});*/

// ************************* 명령어 관련 서비스 등록 *****************************//
service.register('executeCommand', function(message) {
    const { command } = message.payload;
    console.log(`명령 실행: ${command}`);

    sendCommand(command);

    message.respond({
        returnValue: true,
        responseText: "Command executed"
    });
});



// ************************* 속도 명령어 관련 서비스 등록 *****************************//
service.register('executeCommand2', function(message) {
    const { direction } = message.payload;
    console.log(`방향 명령 실행: ${direction}`);

    sendCommand(direction);

    message.respond({
        returnValue: true,
        responseText: "Direction command executed"
    });
});

// ************************* 서버 시작 등록 *****************************//
service.register("startServer", function(message) {
    console.log('WebSocketServer on?');
    app.listen(port);
    console.log('WebSocketServer on!');

    const sub = service.subscribe(`luna://${pkgInfo.name}/heartbeat`, {subscribe:true});
    sub.addListener("response", function(msg) {
        console.log(JSON.stringify(msg.payload));
    });

    message.respond({
        returnValue: true,
        Response: "Start Server!"
    });
});


// ***************************** Heartbeat *****************************
// send responses to each subscribed client
function sendResponses() {
    // console.log(logHeader, "send_response");
    // console.log("Sending responses, subscription count=" + Object.keys(subscriptions).length);
    for (const i in subscriptions) {
        if (Object.prototype.hasOwnProperty.call(subscriptions, i)) {
            const s = subscriptions[i];
            s.respond({
                returnValue: true,
                event: "beat " + x
            });
        }
    }
    x++;
}

// handle subscription requests
const subscriptions = {};
let interval;
let x = 1;
function createInterval() {
    if (interval) {
        return;
    }
    console.log(logHeader, "create_interval");
    console.log("create new interval");
    interval = setInterval(function() {
        sendResponses();
    }, 1000);
}

// ***************************** Create Toast *****************************
function createToast(message) {
    console.log(logHeader, "createToast 호출됨:", message);
    service.call("luna://com.webos.notification/createToast", { message: message }, function(response) {
        if (response.returnValue) {
            console.log(logHeader, "Toast displayed successfully.");
        } else {
            console.error(logHeader, "Failed to display toast:", response.errorText);
        }
    });
}

// 클라이언트에서 호출할 수 있는 Toast 메서드
service.register("showToast", function(message) {
    console.log(logHeader, "showToast 호출됨:", message.payload.message); 
    createToast(message.payload.message);
});



// ***************************** Heartbeat *****************************
const heartbeat2 = service.register("heartbeat");

heartbeat2.on("request", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/heartbeat/request");
    console.log("heartbeat callback");
    message.respond({event: "beat"});
    if (message.isSubscription) {
        subscriptions[message.uniqueToken] = message;
        if (!interval) {
            createInterval();
        }
    }
});

heartbeat2.on("cancel", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/heartbeat/cancel");
    console.log("Canceled " + message.uniqueToken);
    delete subscriptions[message.uniqueToken];
    const keys = Object.keys(subscriptions);
    if (keys.length === 0) {
        console.log("no more subscriptions, canceling interval");
        clearInterval(interval);
        interval = undefined;
    }
});