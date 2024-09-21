import cv2
import numpy as np

# 세가지 특정 색공간 범위 이외에 다른 색은 검정으로 변환하는 코드

def extract_colors(frame):
    # HSV 색공간으로 변환
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # 색상 범위 설정 (HSV)
    # lower_red = np.array([0, 100, 100])
    # upper_red = np.array([10, 255, 255])
    lower_red = np.array([0, 50, 50])  # H 값을 더 낮게 설정
    upper_red = np.array([10, 255, 255])  # H 값을 더 높게 설정
    lower_orange = np.array([11, 100, 100])
    upper_orange = np.array([25, 255, 255])
    lower_yellow = np.array([26, 100, 100])
    upper_yellow = np.array([34, 255, 255])

    # 각 색상에 대한 마스크 생성
    mask_red = cv2.inRange(hsv, lower_red, upper_red)
    mask_orange = cv2.inRange(hsv, lower_orange, upper_orange)
    mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)

    # 마스크 합치기
    mask = cv2.bitwise_or(mask_red, mask_orange)
    mask = cv2.bitwise_or(mask, mask_yellow)

    # 원본 이미지에 마스크 적용
    result = cv2.bitwise_and(frame, frame, mask=mask)
    return result


def main():
    cap = cv2.VideoCapture("http://192.168.68.229:8080/?action=stream")
    if not cap.isOpened():
        print("카메라를 열 수 없습니다.")
        return -1

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        result = extract_colors(frame)
        cv2.imshow('video', result)
        if cv2.waitKey(1) == 27:  # ESC 키를 누르면 종료
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
