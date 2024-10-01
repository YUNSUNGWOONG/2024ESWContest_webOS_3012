from flask import Flask, render_template, Response
import cv2
import torch
import numpy as np
import copy

"""
작물을 탐지하고 cv2 웹 스트리밍서버를 퍼블리싱하는 코드
"""

app = Flask(__name__)
#capture = cv2.VideoCapture(0)  # 웹캠으로부터 비디오 캡처 객체 생성
#capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)  # 캡처된 비디오의 폭 설정
#capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)  # 캡처된 비디오의 높이 설정

def load_yolov5():
    # YOLOv5 모델 로드
    model = torch.hub.load('ultralytics/yolov5', 'custom', path='./../models/best.pt')
    return model

def detect_objects(model, frame):
    # 객체 탐지 수행
    results = model(frame)
    return results

def draw_labels(results, frame):
    labels, cords = results.xyxyn[0][:, -1].cpu().numpy(), results.xyxyn[0][:, :-1].cpu().numpy()
    # label[1]: apple
    # label[2]: orange
    # label[3]: lemon
    n = len(labels)
    if len(labels) > 0:
        if labels[0] == 1:
            print("Apple!!") # 예를 들어, 목적에 맞는 버킷으로 회전시키고, 3초동안 컨베이어벨트 움직이게 하기, 그동안 벨트 뒤에 있는 작물이 카메라에 찍히지 않게, 서보모터라 팬스 쳐두기
        elif labels[0] == 2:
            print("Orange!!")
        elif labels[0] == 3:
            print("Lemon!!")
        else:
            print("The other!!")
        

    x_shape, y_shape = frame.shape[1], frame.shape[0]

    for i in range(n):
        row = cords[i]
        if row[4] >= 0.5:  # confidence threshold
            x1, y1, x2, y2 = int(row[0] * x_shape), int(row[1] * y_shape), int(row[2] * x_shape), int(row[3] * y_shape)
            bgr = (0, 255, 0)
            cv2.rectangle(frame, (x1, y1), (x2, y2), bgr, 2)
            cv2.putText(frame, f'{results.names[int(labels[i])]} {row[4]:.2f}', (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, bgr, 2)

    return frame

def GenerateFrames():
    cap = cv2.VideoCapture(0)  # 웹캠으로부터 비디오 캡처 객체 생성
    
    if not cap.isOpened():
        print("카메라를 열 수 없습니다.")
        return -1

    model = load_yolov5()

    while True:
        ref, frame = cap.read()  # 비디오 프레임을 읽어옵니다.
        if not ref:  # 비디오 프레임을 제대로 읽어오지 못했다면 반복문을 종료합니다.
            break
        
        converted_frame = copy.deepcopy(frame)

        # 명암 조절
        contrast_image = cv2.convertScaleAbs(converted_frame, alpha=1.4)

        results = detect_objects(model, contrast_image)
        frame = draw_labels(results, contrast_image)

        ref, buffer = cv2.imencode('.jpg', frame)  # JPEG 형식으로 이미지를 인코딩합니다.
        frame = buffer.tobytes()  # 인코딩된 이미지를 바이트 스트림으로 변환합니다.
        # multipart/x-mixed-replace 포맷으로 비디오 프레임을 클라이언트에게 반환합니다.
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


# @app.route('/')
# def Index():
#     return render_template('index.html')  # index.html 파일을 렌더링하여 반환합니다.


@app.route('/')
def Stream():
    # GenerateFrames 함수를 통해 비디오 프레임을 클라이언트에게 실시간으로 반환합니다.
    return Response(GenerateFrames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    # 라즈베리파이의 IP 번호와 포트 번호를 지정하여 Flask 앱을 실행합니다.
    app.run(host="0.0.0.0", port="5000")