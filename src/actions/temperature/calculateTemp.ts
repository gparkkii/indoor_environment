// Linear regression calculation
const linearFit = (
    x: number[],
    y: number[]
): { slope: number; intercept: number } => {
    const n = x.length;
    const xSum = x.reduce((a, b) => a + b, 0);
    const ySum = y.reduce((a, b) => a + b, 0);
    const xySum = x.map((xi, idx) => xi * y[idx]).reduce((a, b) => a + b, 0);
    const xSqSum = x.map((xi) => xi ** 2).reduce((a, b) => a + b, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSqSum - xSum ** 2);
    const intercept = (ySum - slope * xSum) / n;

    return { slope, intercept };
};

// Calculate R-squared
const calculateRSquared = (
    x: number[],
    y: number[],
    slope: number,
    intercept: number
): number => {
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const ssTot = y.reduce((a, yi) => a + (yi - yMean) ** 2, 0);
    const ssRes = y.reduce(
        (a, yi, idx) => a + (yi - (slope * x[idx] + intercept)) ** 2,
        0
    );
    return 1 - ssRes / ssTot;
};

// Function to find closest R-squared to target value
const findClosestRSquared = (
    wTemp: number[],
    mTemp: number[],
    targetRSquared: number,
    conditionFn: (temp: number, limit: number) => boolean
) => {
    let closestRSquared = Number.POSITIVE_INFINITY;
    let closestLimit = 0;
    let closestRSquaredValue = 0;

    const rSquaredRange: { limit: number; rSquared: number }[] = [];

    for (
        let limit = Math.min(...wTemp);
        limit <= Math.max(...wTemp);
        limit += 0.1
    ) {
        const filteredRange = wTemp
            .map((temp, index) => ({ temp, mTemp: mTemp[index] }))
            .filter(({ temp }) => conditionFn(temp, limit));

        if (filteredRange.length === 0) continue;

        const wTempsFiltered = filteredRange.map((data) => data.temp);
        const mTempsFiltered = filteredRange.map((data) => data.mTemp);

        const { slope, intercept } = linearFit(wTempsFiltered, mTempsFiltered);
        const rSquared = calculateRSquared(
            wTempsFiltered,
            mTempsFiltered,
            slope,
            intercept
        );

        rSquaredRange.push({ limit, rSquared });

        const diff = Math.abs(rSquared - targetRSquared);
        if (diff < closestRSquared) {
            closestRSquared = diff;
            closestLimit = limit;
            closestRSquaredValue = rSquared;
        }
    }

    return { closestLimit, closestRSquaredValue };
};

// Main function to calculate hTemp and cTemp
export const calculateTemp = (
    wTemp: number[],
    mTemp: number[],
    targetRSquared = 0.5
) => {
    // Heating calculation
    const heatingResult = findClosestRSquared(
        wTemp,
        mTemp,
        targetRSquared,
        (temp, limit) => temp >= limit // Heating: wTemp >= limit
    );
    const hTemp = heatingResult.closestLimit;
    const hTempRSquared = heatingResult.closestRSquaredValue;

    const { slope: hSlope, intercept: hIntercept } = linearFit(
        wTemp.filter((temp) => temp >= hTemp),
        mTemp.filter((_, idx) => wTemp[idx] >= hTemp)
    );
    const hTempIn = hSlope * hTemp + hIntercept;

    // Cooling calculation
    const coolingResult = findClosestRSquared(
        wTemp,
        mTemp,
        targetRSquared,
        (temp, limit) => temp <= limit // Cooling: wTemp <= limit
    );
    const cTemp = coolingResult.closestLimit;
    const cTempRSquared = coolingResult.closestRSquaredValue;

    const { slope: cSlope, intercept: cIntercept } = linearFit(
        wTemp.filter((temp) => temp <= cTemp),
        mTemp.filter((_, idx) => wTemp[idx] <= cTemp)
    );
    const cTempIn = cSlope * cTemp + cIntercept;

    return {
        hTemp,
        hTempIn,
        hTempRSquared,
        cTemp,
        cTempIn,
        cTempRSquared,
    };
};
