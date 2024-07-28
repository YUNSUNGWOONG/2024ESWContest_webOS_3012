import cv2
import zmq
import base64
import numpy as np
import threading

def send_images():
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

def receive_images():
    # ZeroMQ 설정
    context = zmq.Context()
    result_socket = context.socket(zmq.SUB)
    result_socket.connect('tcp://<외부 장치 IP>:5556')  # 실제 외부 장치 IP로 변경
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

if __name__ == "__main__":
    # 송신 및 수신 스레드를 생성하고 시작
    send_thread = threading.Thread(target=send_images)
    receive_thread = threading.Thread(target=receive_images)
    
    send_thread.start()
    receive_thread.start()

    # 스레드가 종료될 때까지 대기
    send_thread.join()
    receive_thread.join()
