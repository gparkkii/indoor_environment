import {
    DataRow,
    MProcessedDataRow,
    ParsedDataRow,
    WProcessedDataRow,
} from '../actions/temperature/@types';

// 시간 데이터를 Date 객체로 변환하고, 날짜 형식 검증
const convertToDate = (data: DataRow[]): ParsedDataRow[] => {
    return data.map((entry, index) => {
        const date = new Date(entry.tm);
        if (isNaN(date.getTime())) {
            console.error(`Invalid date format at row ${index}: ${entry.tm}`);
            throw new Error(`Invalid date format at row ${index}`);
        }
        return {
            ...entry,
            tm: date,
        };
    });
};

// 데이터가 시간 단위로 되어 있는지 확인
const checkHourlyInterval = (data: ParsedDataRow[]) => {
    for (let i = 1; i < data.length; i++) {
        const previous = data[i - 1].tm;
        const current = data[i].tm;
        const interval = (current.getTime() - previous.getTime()) / (1000 * 60); // 분 단위로 변환

        // 60분이 아닌 경우(정확히 한 시간이 아닌 경우) false 반환
        if (interval !== 60) {
            return false;
        }
    }
    return true;
};

// 시간 단위로 리샘플링 (평균 값으로 계산)
const resampleHourly = (data: ParsedDataRow[]) => {
    const hourlyData: {
        [key: string]: { tempSum: number; humiSum: number; count: number };
    } = {};

    data.forEach((entry) => {
        // 'YYYY-MM-DD HH' 형식의 키를 생성, 이때 `tm`을 로컬 시간대로 변환
        const date = new Date(entry.tm);
        const localHour = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}`;

        if (!hourlyData[localHour]) {
            hourlyData[localHour] = {
                tempSum: entry.temp,
                humiSum: entry.humi,
                count: 1,
            };
        } else {
            hourlyData[localHour].tempSum += entry.temp;
            hourlyData[localHour].humiSum += entry.humi;
            hourlyData[localHour].count += 1;
        }
    });

    // `tm`을 로컬 시간대로 설정하고 type에 따라 필드 이름을 동적으로 설정
    return Object.keys(hourlyData).map((localHour) => {
        const [datePart, hourPart] = localHour.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const hour = parseInt(hourPart, 10);

        return {
            tm: new Date(year, month - 1, day, hour), // 로컬 시간대 적용
            mTemp:
                Math.round(
                    (hourlyData[localHour].tempSum /
                        hourlyData[localHour].count) *
                        10
                ) / 10,
            mHumi:
                Math.round(
                    (hourlyData[localHour].humiSum /
                        hourlyData[localHour].count) *
                        10
                ) / 10,
        };
    }) as unknown as MProcessedDataRow[];
};

// 24시간 이동평균 계산 함수
const calculateMovingAverageOptimized = (
    data: ParsedDataRow[],
    windowSize: number
): WProcessedDataRow[] => {
    let tempSum = 0;
    let humiSum = 0;
    const result: WProcessedDataRow[] = [];

    data.forEach((point, index) => {
        tempSum += point.temp;
        humiSum += point.humi;

        // 가용한 데이터만을 기반으로 점진적 평균을 계산
        const effectiveWindowSize = Math.min(windowSize, index + 1);
        const wTemp = Math.round((tempSum / effectiveWindowSize) * 10) / 10;
        const wHumi = Math.round((humiSum / effectiveWindowSize) * 10) / 10;

        result.push({ tm: point.tm, wTemp, wHumi });

        // windowSize에 도달하면 가장 오래된 값을 빼고 이동 평균 유지
        if (index >= windowSize - 1) {
            tempSum -= data[index - windowSize + 1].temp;
            humiSum -= data[index - windowSize + 1].humi;
        }
    });

    return result;
};

export const resampleWthrData = async (
    parsedData: DataRow[]
): Promise<{
    result: 'success' | 'error';
    data: WProcessedDataRow[];
}> => {
    try {
        const convertedData = convertToDate(parsedData);

        // 데이터를 tm 열 기준으로 시간순으로 정렬
        const sortedData = convertedData.sort(
            (a, b) => a.tm.getTime() - b.tm.getTime()
        );

        const movingAverage = calculateMovingAverageOptimized(sortedData, 24);

        console.log('24-hour Moving Average Data (Already Hourly)');
        return { result: 'success', data: movingAverage };
    } catch (error) {
        console.error('An error occurred:', error);
        return { result: 'error', data: [] };
    }
};

// 리샘플링된 데이터를 사용하여 24시간 이동평균 계산
export const resampleCSVData = async (
    parsedData: DataRow[]
): Promise<{
    result: 'success' | 'error';
    data: MProcessedDataRow[];
}> => {
    try {
        const convertedData = convertToDate(parsedData);

        // 데이터를 tm 열 기준으로 시간순으로 정렬
        const sortedData = convertedData.sort(
            (a, b) => a.tm.getTime() - b.tm.getTime()
        );

        // 데이터가 정확히 1시간 간격인지 확인
        if (!checkHourlyInterval(sortedData)) {
            // 1시간 간격이 아닌 경우 리샘플링 수행
            const resampledData = resampleHourly(sortedData);

            console.log('24-hour Moving Average Data (Resampled)');
            return { result: 'success', data: resampledData };
        } else {
            // 이미 1시간 간격인 경우 temp, humi 필드를 mTemp, mHumi 또는 wTemp, wHumi로 변환
            const updatedData = sortedData.map((entry) => {
                return {
                    tm: entry.tm,
                    mTemp: entry.temp,
                    mHumi: entry.humi,
                    userStnId: entry.stnId,
                };
            }) as unknown as MProcessedDataRow[];
            console.log('24-hour Moving Average Data (Already Hourly)');
            return { result: 'success', data: updatedData };
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return { result: 'error', data: [] };
    }
};
