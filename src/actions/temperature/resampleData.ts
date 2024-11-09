import {
    DataRow,
    MProcessedDataRow,
    ParsedDataRow,
    WProcessedDataRow,
} from './@types';

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

    return intervals.every((interval) => interval === 0 || interval === 1);
};

// 시간 단위로 리샘플링 (평균 값으로 계산)
const resampleHourly = (data: ParsedDataRow[]) => {
    const hourlyData: {
        [key: string]: { tempSum: number; humiSum: number; count: number };
    } = {};

    data.forEach((entry) => {
        const hourKey = new Date(entry.tm).toISOString().slice(0, 13); // Get hour as key
        if (!hourlyData[hourKey]) {
            hourlyData[hourKey] = {
                tempSum: entry.temp,
                humiSum: entry.humi,
                count: 1,
            };
        } else {
            hourlyData[hourKey].tempSum += entry.temp;
            hourlyData[hourKey].humiSum += entry.humi;
            hourlyData[hourKey].count += 1;
        }
    });
    return Object.keys(hourlyData).map((hourKey) => ({
        tm: new Date(`${hourKey}:00:00`),
        temp:
            Math.round(
                (hourlyData[hourKey].tempSum / hourlyData[hourKey].count) * 10
            ) / 10,
        humi:
            Math.round(
                (hourlyData[hourKey].humiSum / hourlyData[hourKey].count) * 10
            ) / 10,
    }));
};

// 24시간 이동평균 계산 함수
const calculateMovingAverage = (
    data: ParsedDataRow[],
    hours: number,
    type: 'm' | 'w'
) => {
    const mMovingAverageData: MProcessedDataRow[] = [];
    const wMovingAverageData: WProcessedDataRow[] = [];

    data.forEach((entry, index) => {
        const rangeData = data.slice(Math.max(0, index - hours + 1), index + 1); // 24-hour range

        const tempSum = rangeData.reduce((sum, item) => sum + item.temp, 0);
        const humiSum = rangeData.reduce((sum, item) => sum + item.humi, 0);
        const tempAvg = tempSum / rangeData.length;
        const humiAvg = humiSum / rangeData.length;

        if (type === 'm') {
            mMovingAverageData.push({
                ...entry,
                mTemp: Math.round(tempAvg * 10) / 10,
                mHumi: Math.round(humiAvg * 10) / 10,
                userStnId: entry.stnId,
            });
        } else {
            wMovingAverageData.push({
                ...entry,
                wTemp: Math.round(tempAvg * 10) / 10,
                wHumi: Math.round(humiAvg * 10) / 10,
                userStnId: entry.stnId,
            });
        }
    });

    return type === 'm' ? mMovingAverageData : wMovingAverageData;
};

// 리샘플링된 데이터를 사용하여 24시간 이동평균 계산
export const calculate24HourMovingAverage = async (
    parsedData: DataRow[],
    type: 'm' | 'w'
): Promise<{
    result: 'success' | 'error';
    data: WProcessedDataRow[] | MProcessedDataRow[];
}> => {
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
            return { result: 'success', data: movingAverageData };
        } else {
            const movingAverageData = calculateMovingAverage(
                sortedData,
                24,
                type
            );
            console.log(
                'Data is already in hourly intervals with 24-hour Moving Average'
            );
            return { result: 'success', data: movingAverageData };
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return { result: 'error', data: [] };
    }
};
