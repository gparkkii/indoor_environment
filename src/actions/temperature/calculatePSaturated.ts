import { DataRow } from './@types';

const calculatePSaturated = (
    mTemp: number[],
    wTemp: number[]
): { p_sat_i: number[]; p_sat_o: number[] } => {
    const p_sat_i = mTemp.map((t) =>
        t < 0
            ? 610.5 * Math.exp((21.875 * t) / (265.5 + t))
            : 610.5 * Math.exp((17.269 * t) / (237.3 + t))
    );

    const p_sat_o = wTemp.map((t) =>
        t < 0
            ? 610.5 * Math.exp((21.875 * t) / (265.5 + t))
            : 610.5 * Math.exp((17.269 * t) / (237.3 + t))
    );

    return { p_sat_i, p_sat_o };
};

export const calculateVaporPressure = (
    data: {
        tm: Date;
        mTemp: number;
        mHumi: number;
        wTemp: number;
        wHumi: number;
    }[]
) => {
    // 포화 수증기압 계산
    const mTemps = data.map((value) => value.mTemp);
    const wTemps = data.map((value) => value.wTemp);
    const { p_sat_i, p_sat_o } = calculatePSaturated(mTemps, wTemps);

    // 수증기분압 계산
    const mHumi = data.map((value) => value.mHumi);
    const wHumi = data.map((value) => value.wHumi);

    const pi = p_sat_i.map(
        (p, i) => Math.round(p * (mHumi[i] / 100) * 100) / 100
    );
    const po = p_sat_o.map(
        (p, i) => Math.round(p * (wHumi[i] / 100) * 100) / 100
    );
    const pdiff = pi.map((p, i) => Math.round((p - po[i]) * 100) / 100);

    return { pi, po, pdiff };
};
