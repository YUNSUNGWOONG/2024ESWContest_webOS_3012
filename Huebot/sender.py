import cv2
import zmq
import base64

# ZeroMQ 설정
context = zmq.Context()
footage_socket = context.socket(zmq.PUB)
footage_socket.bind('tcp://*:5555')

# 카메라 설정
camera = cv2.VideoCapture(0)

while True:
    grabbed, frame = camera.read()
    if not grabbed:
        break
    encoded, buffer = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(buffer)
    footage_socket.send(jpg_as_text)
