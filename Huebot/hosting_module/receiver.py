import cv2
import zmq
import base64
import numpy as np

# ZeroMQ 설정
context = zmq.Context()
result_socket = context.socket(zmq.SUB)
result_socket.connect('tcp://<외부 장치 IP>:5556')
result_socket.setsockopt_string(zmq.SUBSCRIBE, '')

while True:
    frame = result_socket.recv()
    img = base64.b64decode(frame)
    npimg = np.frombuffer(img, dtype=np.uint8)
    source = cv2.imdecode(npimg, 1)
    
    cv2.imshow("Object Detection", source)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()