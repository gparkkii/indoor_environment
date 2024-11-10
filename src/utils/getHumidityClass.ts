const humidityClass = {
    1: [0, 1360],
    2: [1080, 1360],
    3: [810, 1080],
    4: [640, 810],
    5: [270, 640],
};

export function getHumidityClass(hpDiff: number) {
    if (1080 <= hpDiff && hpDiff < 1360) {
        return 5;
    }
    if (810 <= hpDiff && hpDiff < 1080) {
        return 4;
    }
    if (640 <= hpDiff && hpDiff < 810) {
        return 3;
    }
    if (270 <= hpDiff && hpDiff < 640) {
        return 2;
    }
    if (270 > hpDiff) {
        return 1;
    }
}
