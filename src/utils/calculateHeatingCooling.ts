import { mean } from 'simple-statistics';

type InputData = {
    wTemp: number[];
    mTemp: number[];
    p_diff: number[];
};

type Result = {
    hTemp?: number;
    hTempRSquared?: number;
    hTempIn?: number;
    cTemp?: number;
    cTempRSquared?: number;
    cTempIn?: number;
    hHumi?: number;
    hHumiRSquared?: number;
    hPDiff?: number;
    cHumi?: number;
    cHumiRSquared?: number;
    cPDiff?: number;
};

// 선형 회귀 함수 (Python np.polyfit 유사)
function linearRegression(
    x: number[],
    y: number[]
): { slope: number; intercept: number } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

// 상관 계수 기반 R-squared 계산 (Python np.corrcoef 유사)
function calculateRSquaredFromCorrelation(x: number[], y: number[]): number {
    const xMean = mean(x);
    const yMean = mean(y);

    const numerator = x.reduce(
        (acc, xi, i) => acc + (xi - xMean) * (y[i] - yMean),
        0
    );
    const denominatorX = Math.sqrt(
        x.reduce((acc, xi) => acc + Math.pow(xi - xMean, 2), 0)
    );
    const denominatorY = Math.sqrt(
        y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0)
    );

    const correlation = numerator / (denominatorX * denominatorY);
    return Math.pow(correlation, 2); // R-squared
}

// Python과 동일한 범위 생성 함수
const calculateLimits = (min: number, max: number, step: number): number[] => {
    const limits: number[] = [];
    for (let i = min; i <= max; i += step) {
        limits.push(Math.round(i * 100) / 100); // 소수점 두 자리에서 반올림
    }
    return limits;
};

// 가장 가까운 R-squared를 찾는 함수
const findClosestRSquared = (
    range: { limit: number; r_squared: number }[],
    target: number
) => {
    let closestDifference = Infinity;
    let closestLimit = 0;
    let closestRSquared = 0;
    range.forEach(({ limit, r_squared }) => {
        const difference = Math.abs(r_squared - target);
        if (difference < closestDifference) {
            closestDifference = difference;
            closestLimit = limit;
            closestRSquared = r_squared;
        }
    });
    return { closestLimit, closestRSquared };
};

export const calculateHeatingCoolingLimits = (data: InputData): Result => {
    const { wTemp, mTemp, p_diff } = data;
    if (wTemp.length !== mTemp.length || wTemp.length !== p_diff.length) {
        throw new Error('Input arrays must have the same length.');
    }

    const combinedData = wTemp.map((temp, index) => ({
        wTemp: temp,
        mTemp: mTemp[index],
        p_diff: p_diff[index],
    }));

    const heating_max = Math.min(...wTemp);
    const cooling_max = Math.max(...wTemp);

    const heating_limits = calculateLimits(heating_max, heating_max + 30, 0.1);
    const cooling_limits = calculateLimits(cooling_max - 30, cooling_max, 0.1);

    const target_r_squared = 0.5;
    const results_temp: Result[] = [];
    const results_pdiff: Result[] = [];

    const r_squared_columns: ('mTemp' | 'p_diff')[] = ['mTemp', 'p_diff'];

    r_squared_columns.forEach((r_squared_column) => {
        const r_squared_rh_range_h: { limit: number; r_squared: number }[] = [];
        const r_squared_rh_range_c: { limit: number; r_squared: number }[] = [];

        heating_limits.forEach((heating_limit) => {
            const heating_range = combinedData.filter(
                (row) => row.wTemp <= heating_limit && row.wTemp >= heating_max
            );
            if (heating_range.length > 1) {
                const x = heating_range.map((row) => row.wTemp);
                const y = heating_range.map((row) => row[r_squared_column]);
                const { slope, intercept } = linearRegression(x, y);
                const predicted = x.map((xVal) => slope * xVal + intercept);
                const r_squared_h = calculateRSquaredFromCorrelation(
                    y,
                    predicted
                );
                r_squared_rh_range_h.push({
                    limit: heating_limit,
                    r_squared: r_squared_h,
                });
            }
        });

        cooling_limits.forEach((cooling_limit) => {
            const cooling_range = combinedData.filter(
                (row) => row.wTemp >= cooling_limit && row.wTemp <= cooling_max
            );
            if (cooling_range.length > 1) {
                const x = cooling_range.map((row) => row.wTemp);
                const y = cooling_range.map((row) => row[r_squared_column]);
                const { slope, intercept } = linearRegression(x, y);
                const predicted = x.map((xVal) => slope * xVal + intercept);
                const r_squared_c = calculateRSquaredFromCorrelation(
                    y,
                    predicted
                );
                r_squared_rh_range_c.push({
                    limit: cooling_limit,
                    r_squared: r_squared_c,
                });
            }
        });

        if (r_squared_column === 'mTemp') {
            const { closestLimit: hTemp, closestRSquared: hTempRSquared } =
                findClosestRSquared(r_squared_rh_range_h, target_r_squared);
            const { closestLimit: cTemp, closestRSquared: cTempRSquared } =
                findClosestRSquared(r_squared_rh_range_c, target_r_squared);

            const heatingRangeF = combinedData.filter(
                (row) => row.wTemp <= hTemp && row.wTemp >= heating_max
            );
            const coolingRangeF = combinedData.filter(
                (row) => row.wTemp >= cTemp && row.wTemp <= cooling_max
            );

            const hTempIn = mean(heatingRangeF.map((row) => row.mTemp));
            const cTempIn = mean(coolingRangeF.map((row) => row.mTemp));

            results_temp.push({
                hTemp: hTemp,
                hTempRSquared: hTempRSquared,
                hTempIn: hTempIn,
                cTemp: cTemp,
                cTempRSquared: cTempRSquared,
                cTempIn: cTempIn,
            });
        } else if (r_squared_column === 'p_diff') {
            const { closestLimit: hHumi, closestRSquared: hHumiRSquared } =
                findClosestRSquared(r_squared_rh_range_h, target_r_squared);
            const { closestLimit: cHumi, closestRSquared: cHumiRSquared } =
                findClosestRSquared(r_squared_rh_range_c, target_r_squared);

            const heatingRangeP = combinedData.filter(
                (row) => row.wTemp <= hHumi && row.wTemp >= heating_max
            );
            const coolingRangeP = combinedData.filter(
                (row) => row.wTemp >= cHumi && row.wTemp <= cooling_max
            );

            const hPDiff = mean(heatingRangeP.map((row) => row.p_diff));
            const cPDiff = mean(coolingRangeP.map((row) => row.p_diff));

            results_pdiff.push({
                hHumi: hHumi,
                hHumiRSquared: hHumiRSquared,
                hPDiff: hPDiff,
                cHumi: cHumi,
                cHumiRSquared: cHumiRSquared,
                cPDiff: cPDiff,
            });
        }
    });

    return { ...results_temp[0], ...results_pdiff[0] };
};
