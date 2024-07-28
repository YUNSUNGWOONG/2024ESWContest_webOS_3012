import cv2
import zmq
import base64
import numpy as np
import tensorflow as tf

# ZeroMQ 설정
context = zmq.Context()
footage_socket = context.socket(zmq.SUB)
footage_socket.connect('tcp://192.168.190.229:5555')
footage_socket.setsockopt_string(zmq.SUBSCRIBE, '')

result_socket = context.socket(zmq.PUB)
result_socket.bind('tcp://*:5556')

# TensorFlow 모델 로드
model_path = 'ssd_mobilenet_v2_coco_2018_03_29/saved_model'
detect_fn = tf.saved_model.load(model_path)

while True:
    frame = footage_socket.recv()
    img = base64.b64decode(frame)
    npimg = np.frombuffer(img, dtype=np.uint8)
    source = cv2.imdecode(npimg, 1)

    # 객체 탐지 수행
    input_tensor = tf.convert_to_tensor([source], dtype=tf.uint8)
    detections = detect_fn.signatures['serving_default'](input_tensor)

    # 결과 전송 (원하는 처리 추가 가능)
    _, buffer = cv2.imencode('.jpg', source)
    result_socket.send(base64.b64encode(buffer))
