interface HumiCalculationResult {
    hHumi: number;
    hHumiRSquared: number;
    hPDiff: number;
    cHumi: number;
    cHumiRSquared: number;
}

// Linear regression function to calculate slope and intercept
function linearFit(
    x: number[],
    y: number[]
): { slope: number; intercept: number } {
    const n = x.length;
    const xSum = x.reduce((a, b) => a + b, 0);
    const ySum = y.reduce((a, b) => a + b, 0);
    const xySum = x.map((xi, idx) => xi * y[idx]).reduce((a, b) => a + b, 0);
    const xSqSum = x.map((xi) => xi ** 2).reduce((a, b) => a + b, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSqSum - xSum ** 2);
    const intercept = (ySum - slope * xSum) / n;

    return { slope, intercept };
}

// Function to calculate R-squared
function calculateRSquared(
    x: number[],
    y: number[],
    slope: number,
    intercept: number
): number {
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const ssTot = y.reduce((a, yi) => a + (yi - yMean) ** 2, 0);
    const ssRes = y.reduce(
        (a, yi, idx) => a + (yi - (slope * x[idx] + intercept)) ** 2,
        0
    );
    return 1 - ssRes / ssTot;
}

// Find the closest R-squared to the target value
function findClosestLimit(
    limits: number[],
    wTemp: number[],
    pDiff: number[],
    targetRSquared: number,
    minTemp: number,
    maxTemp: number,
    ascending: boolean
) {
    let closestDifference = Infinity;
    let closestLimit = 0;
    let closestRSquared = 0;

    for (const limit of limits) {
        const range = wTemp
            .map((temp, idx) => ({ temp, pDiff: pDiff[idx] }))
            .filter(({ temp }) =>
                ascending
                    ? temp <= limit && temp >= minTemp
                    : temp >= limit && temp <= maxTemp
            );

        if (range.length === 0) continue;

        const temps = range.map((r) => r.temp);
        const diffs = range.map((r) => r.pDiff);

        const { slope, intercept } = linearFit(temps, diffs);
        const rSquared = calculateRSquared(temps, diffs, slope, intercept);

        const difference = Math.abs(rSquared - targetRSquared);

        if (difference < closestDifference) {
            closestDifference = difference;
            closestLimit = limit;
            closestRSquared = rSquared;
        }
    }

    return { closestLimit, closestRSquared };
}

// Main function to calculate hHumi, cHumi, and hPDiff
export function calculateHumi({
    wTemp,
    pdiff,
    targetRSquared = 0.5,
}: {
    wTemp: number[];
    pdiff: number[];
    targetRSquared?: number;
}): HumiCalculationResult {
    // Heating limits calculation
    const heatingMax = Math.min(...wTemp);
    const heatingLimits = Array.from({ length: 200 }, (_, i) =>
        (heatingMax + i * 0.1).toFixed(2)
    ).map(Number);

    // Cooling limits calculation
    const coolingMax = Math.max(...wTemp);
    const coolingLimits = Array.from({ length: 200 }, (_, i) =>
        (coolingMax - i * 0.1).toFixed(2)
    ).map(Number);

    // Calculate hHumi
    const { closestLimit: hHumi, closestRSquared: hHumiRSquared } =
        findClosestLimit(
            heatingLimits,
            wTemp,
            pdiff,
            targetRSquared,
            heatingMax,
            coolingMax,
            true
        );

    // Calculate cHumi
    const { closestLimit: cHumi, closestRSquared: cHumiRSquared } =
        findClosestLimit(
            coolingLimits,
            wTemp,
            pdiff,
            targetRSquared,
            heatingMax,
            coolingMax,
            false
        );

    // Calculate hPDiff (equation에서 hHumi를 대입해서 나온 값)
    const { slope, intercept } = linearFit(wTemp, pdiff);
    const hPDiff = slope * hHumi + intercept;

    return {
        hHumi,
        hHumiRSquared,
        hPDiff,
        cHumi,
        cHumiRSquared,
    };
}
