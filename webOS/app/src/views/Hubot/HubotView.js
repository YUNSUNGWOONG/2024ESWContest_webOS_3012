import React, { useState, useEffect } from 'react'; 
import css from './HubotView.module.less';
import LS2Request from '@enact/webos/LS2Request';

var webOSBridge = new LS2Request();

////// showToast //////////////////
const showToast = (message) => {
    var params = {
        "message": message  
    };

    var lsRequest = {
        "service": "luna://com.farm.app.service", 
        "method": "showToast", 
        "parameters": params,
        "onSuccess": onToastSuccess,
        "onFailure": onToastFailure
    };
    webOSBridge.send(lsRequest);
};

const onToastSuccess = (response) => {
    console.log('Toast 호출 성공:', response);
};

const onToastFailure = (error) => {
    console.error('Toast 서비스 호출 실패:', error);
};
/********************************************/

/******************** db 등록 ************************/
const putFruitData = (fruitName, harvestDate, quantity) => {
    const params = {
        "objects": [{
            "_kind": "com.farm.app:1",  // Kind ID
            "fruitName": fruitName,
            "harvestDate": harvestDate,
            "quantity": quantity
        }]
    };

    const lsRequest = {
        "service": "luna://com.webos.service.db",
        "method": "put",
        "parameters": params,
        "onSuccess": (response) => {
            if (response.returnValue) {
                // 등록 성공 시, 날짜-이름-개수 형식으로 메시지 출력
                const successMessage = `등록 성공: ${harvestDate} - ${fruitName} - ${quantity}개`;
                showToast(successMessage);
            } else {
                console.error("과일 데이터 저장 실패:", response.errorText);
                showToast("과일 데이터 저장 실패: " + response.errorText);
            }
        },
        "onFailure": (error) => {
            console.error('과일 데이터 저장 서비스 호출 실패:', error);
            showToast("과일 데이터 저장 중 오류가 발생했습니다.");
        }
    };

    webOSBridge.send(lsRequest);
};

/********************************************/
const HubotView = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedFruit, setSelectedFruit] = useState('');
    const [selectedCount, setSelectedCount] = useState('');

    const handleDateChange = (event) => setSelectedDate(event.target.value);
    const handleFruitChange = (event) => setSelectedFruit(event.target.value);
    const handleCountChange = (event) => setSelectedCount(event.target.value);

    const handleSubmit = () => {
        if (!selectedDate || !selectedFruit || !selectedCount) {
            console.log("모든 항목을 입력해 주세요."); // 콘솔 로그 추가
            showToast("모든 항목을 입력해 주세요."); // showToast 호출
            return;
        }
        putFruitData(selectedFruit, selectedDate, parseInt(selectedCount)); 
    };
    

    return (
        <div className={css.container}>
            <h1 className={css.title}>휴봇</h1>
            <div className={css.gridContainer}>
                <div className={css.widget}>
                    <iframe src="http://192.168.183.158:5000" alt="Camera Stream"></iframe>
                </div>

                <div className={css.widget}>
                    <h2>수확 작물 등록</h2>

                    <div className={css.formGroup}>
                        <label className={css.formLabel}>날짜:</label>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={handleDateChange} 
                            className={css.inputBox} 
                        />
                    </div>

                    <div className={css.formGroup}>
                        <label className={css.formLabel}>과일:</label>
                        <select 
                            value={selectedFruit} 
                            onChange={handleFruitChange} 
                            className={css.selectBox}
                        >
                            <option value="">선택하세요</option>
                            <option value="red">RED</option>
                            <option value="green">GREEN</option>
                            <option value="decay">DECAY</option>
                        </select>
                    </div>

                    <div className={css.formGroup}>
                        <label className={css.formLabel}>개수:</label>
                        <input 
                            type="number" 
                            value={selectedCount} 
                            onChange={handleCountChange} 
                            min="1" 
                            className={css.inputBox} 
                        />
                    </div>

                    <button onClick={handleSubmit} className={css.submitButton}>
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HubotView;
