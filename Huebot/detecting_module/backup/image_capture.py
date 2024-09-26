import cv2
import time

# 데이터셋 수집을 목적으로 이미지를 10장씩 수집하는 코드

# 카메라 열기 (0은 일반적으로 첫 번째 카메라를 의미)
cap = cv2.VideoCapture(0)

# 이미지 저장을 위한 카운터 초기화
count = 191

while True:
    # 카메라에서 한 프레임 읽기
    ret, frame = cap.read()

    # 이미지 저장
    cv2.imwrite(f"./images/image_{count}.jpg", frame)
    print(f"Image {count} saved.")

    # 카운터 증가
    count += 1

    # 1초 대기
    time.sleep(1)

    # 100장 찍으면 종료
    if count > 200:
        break

# 카메라 해제
cap.release()
cv2.destroyAllWindows()