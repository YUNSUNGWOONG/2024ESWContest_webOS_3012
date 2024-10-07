import torch
import cv2
from pathlib import Path
from models.common import DetectMultiBackend
from utils.general import non_max_suppression, scale_boxes
from utils.torch_utils import select_device
from utils.plots import Annotator, colors

from flask import Flask, render_template, Response
import copy
import numpy as np





def GenerateFrames():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Camera is not Opend!!")
        return -1
    
    # 모델 경로와 기본값 설정
    weights = './best.pt'
    device = select_device('cuda:0')
    model = DetectMultiBackend(weights, device=device)
    names = model.names

    while True:
        ref, frame = cap.read()
        if not ref:
            break
        # 카메라를 열었다 할지라도 무슨 이유로 프레임을 못 읽어오면 while문 종료

        # 이미지 전처리: BGR -> RGB, 사이즈 조정
        img = cv2.resize(frame, (640, 480))
        img = img[:,:,::-1].copy()
        img = img.transpose(2,0,1) # HWC => CHW
        img = torch.from_numpy(img).to(device)
        img = img.float() / 255.0
        
        if len(img.shape) == 3:
            img = img[None] # batch dimension added

        # YOLOv5 Inference
        pred = model(img, augment=False, visualize=False)

        # NMS(Non-Maximum Suppression) 적용
        pred = non_max_suppression(pred, 0.25, 0.45, None, False, max_det=1000)

        # 결과처리
        for i, det in enumerate(pred): #탐지결과를 각 이미지별로 처리
            annotator = Annotator(frame, line_width=3, example=str(names)) #annotator 초기화
            if len(det):
                # 탐지된 박스를 원래 프레임 크기에 맞게 스케일링
                det[:, :4] = scale_boxes(img.shape[2:], det[:,:4], frame.shape).round()

                # 각 탐지에 대해 처리
                for *xyxy, conf, cls in reversed(det):
                    label = f'{names[int(cls)]} {conf:.2f}' # 레이블에 클래스 이름과 신뢰도 추가
                    annotator.box_label(xyxy, label, color=colors(cls, True)) # 바운딩 박스 및 레이블 추가
            
            # 결과를 화면에 표시
            frame = annotator.result()
            ret, buffer = cv2.imencode('.jpg', frame) # jpg형식으로 이미지를 인코딩
            frame = buffer.tobytes() # 인코딩된 이미지를 바이트 스트림으로 변환
            yield(b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        


app = Flask(__name__)
@app.route('/')
def Stream():
    # GenerateFrames 함수를 통해 비디오 프레임을 클라이언트에게 실시간으로 반환합니다.
    return Response(GenerateFrames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    # SBC의 IP번호와 포트번호를 지정하여 플라스크 앱을 실행
    app.run(host="0.0.0.0", port="5000")