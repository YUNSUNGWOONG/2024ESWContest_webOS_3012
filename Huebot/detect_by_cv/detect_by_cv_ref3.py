import cv2
import numpy as np

# 흑백영상을 출력하는 코드

def main():
    cap = cv2.VideoCapture("http://192.168.68.229:8080/?action=stream")
    if not cap.isOpened():
        print("카메라를 열 수 없습니다.")
        return -1

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        #result = extract_colors(frame)
        result = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        cv2.imshow('video', result)
        if cv2.waitKey(1) == 27:  # ESC 키를 누르면 종료
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
