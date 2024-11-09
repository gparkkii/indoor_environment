import {
    mean,
    linearRegression,
    linearRegressionLine,
} from 'simple-statistics';

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
    hDiff?: number;
    cHumi?: number;
    cHumiRSquared?: number;
    cPDiff?: number;
    r_squared_column: string;
};

// R-squared 계산 함수
function calculateRSquared(actual: number[], predicted: number[]): number {
    const meanActual = mean(actual);
    const ssTotal = actual.reduce(
        (acc, val) => acc + Math.pow(val - meanActual, 2),
        0
    );
    const ssResidual = actual.reduce(
        (acc, val, i) => acc + Math.pow(val - predicted[i], 2),
        0
    );
    return 1 - ssResidual / ssTotal;
}

// heating 및 cooling limits 생성 함수
const calculateLimits = (min: number, max: number, step: number): number[] => {
    const limits: number[] = [];
    for (let i = min; i <= max; i += step) {
        limits.push(parseFloat(i.toFixed(2)));
    }
    return limits;
};

// 목표 R-squared와 가장 가까운 값을 찾는 함수
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

export const calculateHeatingCoolingLimits = (
    data: InputData
): { results_temp: Result[]; results_pdiff: Result[] } => {
    // 각 배열의 길이가 동일한지 확인
    const { wTemp, mTemp, p_diff } = data;
    if (wTemp.length !== mTemp.length || wTemp.length !== p_diff.length) {
        throw new Error('Input arrays must have the same length.');
    }

    // 데이터를 개별 객체 배열로 변환
    const combinedData = wTemp.map((temp, index) => ({
        wTemp: temp,
        mTemp: mTemp[index],
        p_diff: p_diff[index],
    }));

    // heating_max와 cooling_max 계산
    const heating_max = Math.min(...wTemp);
    const cooling_max = Math.max(...wTemp);

    // heating 및 cooling limits 생성
    const heating_limits = calculateLimits(heating_max, heating_max + 30, 0.1);
    const cooling_limits = calculateLimits(cooling_max - 30, cooling_max, 0.1);

    const target_r_squared = 0.5;
    const results_temp: Result[] = [];
    const results_pdiff: Result[] = [];

    const r_squared_columns: ('mTemp' | 'p_diff')[] = ['mTemp', 'p_diff'];

    r_squared_columns.forEach((r_squared_column) => {
        const r_squared_rh_range_h: { limit: number; r_squared: number }[] = [];
        const r_squared_rh_range_c: { limit: number; r_squared: number }[] = [];

        // heating 결정계수 계산
        heating_limits.forEach((heating_limit) => {
            const heating_range = combinedData.filter(
                (row) => row.wTemp <= heating_limit && row.wTemp >= heating_max
            );
            if (heating_range.length > 1) {
                const x = heating_range.map((row) => row.wTemp);
                const y = heating_range.map((row) => row[r_squared_column]);
                const { m, b } = linearRegression(
                    x.map((xVal, i) => [xVal, y[i]])
                );
                const regressionLine = linearRegressionLine({ m, b });
                const predicted = x.map((xVal) => regressionLine(xVal));
                const r_squared_h = calculateRSquared(y, predicted);
                r_squared_rh_range_h.push({
                    limit: heating_limit,
                    r_squared: r_squared_h,
                });
            }
        });

        // cooling 결정계수 계산
        cooling_limits.forEach((cooling_limit) => {
            const cooling_range = combinedData.filter(
                (row) => row.wTemp >= cooling_limit && row.wTemp <= cooling_max
            );
            if (cooling_range.length > 1) {
                const x = cooling_range.map((row) => row.wTemp);
                const y = cooling_range.map((row) => row[r_squared_column]);
                const { m, b } = linearRegression(
                    x.map((xVal, i) => [xVal, y[i]])
                );
                const regressionLine = linearRegressionLine({ m, b });
                const predicted = x.map((xVal) => regressionLine(xVal));
                const r_squared_c = calculateRSquared(y, predicted);
                r_squared_rh_range_c.push({
                    limit: cooling_limit,
                    r_squared: r_squared_c,
                });
            }
        });

        // heating 및 cooling의 목표 R-squared와 가장 가까운 값 찾기
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
                hTemp,
                hTempRSquared,
                hTempIn,
                cTemp,
                cTempRSquared,
                cTempIn,
                r_squared_column: 'hTemp, cTemp',
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
                hHumi,
                hHumiRSquared,
                hDiff: hPDiff,
                cHumi,
                cHumiRSquared,
                cPDiff,
                r_squared_column: 'p_diff',
            });
        }
    });

    return { results_temp, results_pdiff };
};
