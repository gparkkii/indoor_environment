import Decimal from 'decimal.js';
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
        const interval = new Decimal(current.getTime())
            .minus(previous.getTime())
            .dividedBy(1000 * 60); // 분 단위

        if (!interval.equals(60)) {
            return false;
        }
    }
    return true;
};

// 시간 단위로 리샘플링 (평균 값으로 계산)
const resampleHourly = (data: ParsedDataRow[]): MProcessedDataRow[] => {
    const hourlyData: {
        [key: string]: { tempSum: Decimal; humiSum: Decimal; count: number };
    } = {};

    data.forEach((entry) => {
        const date = new Date(entry.tm);
        const localHour = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}`;

        if (!hourlyData[localHour]) {
            hourlyData[localHour] = {
                tempSum: new Decimal(entry.temp),
                humiSum: new Decimal(entry.humi),
                count: 1,
            };
        } else {
            hourlyData[localHour].tempSum = hourlyData[localHour].tempSum.plus(
                entry.temp
            );
            hourlyData[localHour].humiSum = hourlyData[localHour].humiSum.plus(
                entry.humi
            );
            hourlyData[localHour].count += 1;
        }
    });

    return Object.keys(hourlyData).map((localHour) => {
        const [datePart, hourPart] = localHour.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const hour = parseInt(hourPart, 10);

        return {
            tm: new Date(year, month - 1, day, hour),
            mTemp: parseFloat(
                hourlyData[localHour].tempSum
                    .dividedBy(hourlyData[localHour].count)
                    .toFixed(1)
            ),
            mHumi: parseFloat(
                hourlyData[localHour].humiSum
                    .dividedBy(hourlyData[localHour].count)
                    .toFixed(1)
            ),
        };
    });
};

// 24시간 이동평균 계산 함수
const calculateMovingAverageOptimized = (
    data: ParsedDataRow[],
    windowSize: number
): WProcessedDataRow[] => {
    let tempSum = new Decimal(0);
    let humiSum = new Decimal(0);
    const result: WProcessedDataRow[] = [];

    data.forEach((point, index) => {
        tempSum = tempSum.plus(point.temp);
        humiSum = humiSum.plus(point.humi);

        const effectiveWindowSize = Math.min(windowSize, index + 1);
        const wTemp = tempSum.dividedBy(effectiveWindowSize);
        const wHumi = humiSum.dividedBy(effectiveWindowSize);

        result.push({
            tm: point.tm,
            wTemp: parseFloat(wTemp.toFixed(1)),
            wHumi: parseFloat(wHumi.toFixed(1)),
        });

        if (index >= windowSize - 1) {
            tempSum = tempSum.minus(data[index - windowSize + 1].temp);
            humiSum = humiSum.minus(data[index - windowSize + 1].humi);
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
        // Filter out rows where both temp and humi are 0
        const filteredData = parsedData.filter(
            (entry) => entry.temp !== 0 || entry.humi !== 0
        );

        const convertedData = convertToDate(filteredData);

        // Sort data by tm column in ascending order
        const sortedData = convertedData.sort(
            (a, b) => a.tm.getTime() - b.tm.getTime()
        );

        console.log({ filteredData, convertedData, sortedData });

        // Check if data is in exactly 1-hour intervals
        if (!checkHourlyInterval(sortedData)) {
            // Resample if not in hourly intervals
            const resampledData = resampleHourly(sortedData);
            console.log('24-hour Moving Average Data (Resampled)');
            return { result: 'success', data: resampledData };
        } else {
            // If already in 1-hour intervals, map temp and humi fields to mTemp and mHumi
            const updatedData = sortedData.map((entry) => ({
                tm: entry.tm,
                mTemp: entry.temp,
                mHumi: entry.humi,
                userStnId: entry.stnId,
            })) as MProcessedDataRow[];

            console.log('24-hour Moving Average Data (Already Hourly)');
            return { result: 'success', data: updatedData };
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return { result: 'error', data: [] };
    }
};
