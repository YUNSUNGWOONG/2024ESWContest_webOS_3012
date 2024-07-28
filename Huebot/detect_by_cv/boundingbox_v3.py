import cv2
import numpy as np

def load_yolo():
    net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
    with open("coco.names", "r") as f:
        classes = [line.strip() for line in f.readlines()]
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
    return net, classes, output_layers

def detect_objects(img, net, outputLayers):			
    blob = cv2.dnn.blobFromImage(img, 0.00392, (416, 416), (0, 0, 0), True, crop=False)		
    net.setInput(blob)		
    outputs = net.forward(outputLayers)		
    return outputs

def get_box_dimensions(outputs, height, width):
    boxes = []
    confidences = []
    class_ids = []
    for output in outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)
                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)
    return boxes, confidences, class_ids

def draw_labels(boxes, confidences, class_ids, classes, img):
    indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    font = cv2.FONT_HERSHEY_PLAIN
    for i in range(len(boxes)):
        if i in indexes:
            x, y, w, h = boxes[i]
            label = str(classes[class_ids[i]])
            color = (0,255,0)
            cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
            cv2.putText(img, label, (x, y - 5), font, 1, color, 1)
    return img

def main():
    cap = cv2.VideoCapture("http://192.168.190.229:8080/?action=stream")
    if not cap.isOpened():
        print("카메라를 열 수 없습니다.")
        return -1

    net, classes, output_layers = load_yolo()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        height, width, channels = frame.shape
        outputs = detect_objects(frame, net, output_layers)
        boxes, confidences, class_ids = get_box_dimensions(outputs, height, width)
        frame = draw_labels(boxes, confidences, class_ids, classes, frame)

        cv2.imshow('video', frame)
        if cv2.waitKey(1) == 27:  # ESC 키를 누르면 종료
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
