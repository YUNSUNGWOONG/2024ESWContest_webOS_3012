import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import css from './MainPanel.module.less';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import LS2Request from '@enact/webos/LS2Request';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const webOSBridge = new LS2Request();

//**************** showToast 함수 ***************** */
const showToast = (message) => {
    const params = { message };

    const lsRequest = {
        service: 'luna://com.farm.app.service',
        method: 'showToast',
        parameters: params,
        onSuccess: (response) => console.log('Toast 호출 성공:', response),
        onFailure: (error) => console.error('Toast 서비스 호출 실패:', error),
    };
    webOSBridge.send(lsRequest);
};

/********************************************/

// DB에서 데이터를 가져오는 함수 (Luna Service 호출)
const fetchCropDataFromDB = (cropName) => {
    return new Promise((resolve) => {
        const lsRequest = {
            service: 'luna://com.webos.service.db',
            method: 'find',
            parameters: {
                query: {
                    from: 'com.farm.app:1', // DB Kind ID
                    where: [{ prop: 'fruitName', op: '=', val: cropName }],
                },
            },
            onSuccess: (response) => {
                console.log('DB 데이터 조회 성공:', response);
                resolve(response);
            },
            onFailure: (error) => {
                console.error('DB 데이터 조회 실패:', error);
                resolve({ returnValue: false });
            },
        };
        webOSBridge.send(lsRequest);
    });
};

/********************************************/

const MainPanel = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showNewWidgets, setShowNewWidgets] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [barData, setBarData] = useState(null);

    const handleCropChange = async (event) => {
        const crop = event.target.value;
        setSelectedCrop(crop);

        if (crop) {
            // DB에서 데이터 가져오기
            const response = await fetchCropDataFromDB(crop);
            if (response.returnValue && response.results.length > 0) {
                showToast(`${crop}에 대한 수확 데이터가 있습니다.`);
                updateBarData(response.results);
            } else {
                showToast(`${crop}에 대한 수확 데이터가 없습니다.`);
                setBarData(null);
            }
        } else {
            setBarData(null);
        }
    };

    // 차트 데이터 업데이트 함수
    const updateBarData = (data) => {
        if (data.length === 0) {
            setBarData(null);
            return;
        }

        const sortedData = [...data].sort((a, b) => new Date(a.harvestDate) - new Date(b.harvestDate));

        const labels = sortedData.map((item) => item.harvestDate);
        const counts = sortedData.map((item) => item.quantity);


        let backgroundColor;
         if (selectedCrop === 'red') {
        backgroundColor = 'red';
        } else if (selectedCrop === 'green') {
        backgroundColor = '#98fb98'; // 연두색
        } else if (selectedCrop === 'decay') {
        backgroundColor = 'black';
        } else {
        backgroundColor = '#ffa500'; // 기본 색상
        }


        setBarData({
            labels,
            datasets: [
                {
                    label: `${selectedCrop} 수확량`,
                    data: counts,
                    backgroundColor: backgroundColor,
                },
            ],
        });
    };

    const toggleWidgets = () => setShowNewWidgets(!showNewWidgets);

    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={css.container}>
            <h1 className={css.title}>ELECBRO</h1>

            <div className={css.gridContainer}>
                {!showNewWidgets ? (
                    <>
                        {/* 첫 번째 위젯: 날짜 선택 */}
                        <div className={css.calendar}>
                            <h2>오늘 날짜</h2>
                            <p className={css.inlineDate}>
                                {currentDate.toLocaleDateString()} {currentDate.toLocaleTimeString()}
                            </p>

                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                                locale="ko-KR"
                                className={css.customCalendar}
                            />
                        </div>

                        {/* 센서 데이터 위젯 */}
                        <div className={css.sensorData}>
                            <h2>센서 데이터</h2>
                            <div className={css.sensorGrid}>
                                <div className={css.sensorItem}>
                                    <h3>온도</h3>
                                    <p>25°C</p>
                                </div>
                                <div className={css.sensorItem}>
                                    <h3>습도</h3>
                                    <p>60%</p>
                                </div>
                                <div className={css.sensorItem}>
                                    <h3>CO₂</h3>
                                    <p>400ppm</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* 수확 작물 현황 위젯 */}
                        <div className={css.newWidget}>
                            <h2>수확 작물 현황</h2>
                            <div className={css.selectBox}>
                                <select className={css.select} value={selectedCrop} onChange={handleCropChange}>
                                    <option value="">작물 선택</option>
                                    <option value="all">ALL</option>
                                    <option value="red">RED</option>
                                    <option value="green">GREEN</option>
                                    <option value="decay">DECAY</option>
                                </select>
                            </div>

                            {barData ? (
                                <div className={css.chartContainer}>
                                    <Bar data={barData} />
                                </div>
                            ) : (
                                <p>데이터가 없습니다.</p>
                            )}
                        </div>

                        
                        <div className={css.newWidget}>
                            <h2>로봇 상태</h2>
                            <p>(휴봇과 하비봇의 상태)</p>
                        </div>
                    </>
                )}

                <div className={css.arrowButton} onClick={toggleWidgets}>
                    {showNewWidgets ? '◀' : '▶'}
                </div>
            </div>
        </div>
    );
};

export default MainPanel;
