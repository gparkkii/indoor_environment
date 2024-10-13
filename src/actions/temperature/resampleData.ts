import { DataRow, ParsedDataRow, ProcessedDataRow } from './@types';

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
    const intervals = data.map((entry, index) => {
        if (index === 0) return 0;
        const previous = data[index - 1].tm;
        const current = entry.tm;
        return (current.getTime() - previous.getTime()) / (1000 * 60 * 60);
    });

    return intervals.every(
        (interval) => interval === 0 || interval === 1 || interval === 4
    );
};

// 시간 단위로 리샘플링 (평균 값으로 계산)
const resampleHourly = (data: ParsedDataRow[]) => {
    const hourlyData: { [key: string]: ParsedDataRow } = {};

    data.forEach((entry) => {
        const hourKey = new Date(entry.tm).toISOString().slice(0, 13); // 시간 단위로 키를 만듬
        if (!hourlyData[hourKey]) {
            hourlyData[hourKey] = { ...entry };
        } else {
            // 중복된 시간이 있을 경우 평균값을 계산
            hourlyData[hourKey].temp =
                (hourlyData[hourKey].temp + entry.temp) / 2;
            hourlyData[hourKey].humi =
                (hourlyData[hourKey].humi + entry.humi) / 2;
        }
    });

    return Object.values(hourlyData);
};

// 24시간 이동평균 계산 함수
const calculateMovingAverage = (
    data: ParsedDataRow[],
    hours: number,
    type: 'm' | 'w'
) => {
    const movingAverageData: ProcessedDataRow[] = [];

    data.forEach((entry, index) => {
        const startIndex = Math.max(0, index - hours + 1); // 24시간 이전 데이터까지 포함
        const rangeData = data.slice(startIndex, index + 1); // 24시간 범위의 데이터

        // temp와 humi의 평균값 계산
        const tempSum = rangeData.reduce((sum, item) => sum + item.temp, 0);
        const humiSum = rangeData.reduce((sum, item) => sum + item.humi, 0);

        const tempAvg = tempSum / rangeData.length;
        const humiAvg = humiSum / rangeData.length;

        if (type === 'm') {
            movingAverageData.push({
                ...entry,
                mTemp: tempAvg,
                mHumi: humiAvg,
                userStnId: entry.stnId,
            });
        } else {
            movingAverageData.push({
                ...entry,
                wTemp: tempAvg,
                wHumi: humiAvg,
                userStnId: entry.stnId,
            });
        }
    });

    return movingAverageData;
};

// 리샘플링된 데이터를 사용하여 24시간 이동평균 계산
export const calculate24HourMovingAverage = async (
    parsedData: DataRow[],
    type: 'm' | 'w'
) => {
    try {
        const convertedData = convertToDate(parsedData);

        // 데이터를 tm 열 기준으로 시간순으로 정렬
        const sortedData = convertedData.sort(
            (a, b) => a.tm.getTime() - b.tm.getTime()
        );

        if (!checkHourlyInterval(sortedData)) {
            const resampledData = resampleHourly(sortedData);
            const movingAverageData = calculateMovingAverage(
                resampledData,
                24,
                type
            );
            console.log('24-hour Moving Average Data');
            return movingAverageData;
        } else {
            const movingAverageData = calculateMovingAverage(
                sortedData,
                24,
                type
            );
            console.log(
                'Data is already in hourly intervals with 24-hour Moving Average'
            );
            return movingAverageData;
        }
    } catch (error) {
        console.error('An error occurred:', error);
        alert(`An error occurred: ${error}`);
    }
};
