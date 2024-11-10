import Decimal from 'decimal.js';

// 포화 수증기압 계산 함수
const calculatePSaturated = (
    mTemp: number[],
    wTemp: number[]
): { p_sat_i: number[]; p_sat_o: number[] } => {
    const p_sat_i = mTemp.map((t) => {
        const decimalT = new Decimal(t);
        return decimalT.isNegative()
            ? new Decimal(610.5)
                  .times(
                      Decimal.exp(
                          decimalT.times(21.875).dividedBy(decimalT.plus(265.5))
                      )
                  )
                  .toNumber()
            : new Decimal(610.5)
                  .times(
                      Decimal.exp(
                          decimalT.times(17.269).dividedBy(decimalT.plus(237.3))
                      )
                  )
                  .toNumber();
    });

    const p_sat_o = wTemp.map((t) => {
        const decimalT = new Decimal(t);
        return decimalT.isNegative()
            ? new Decimal(610.5)
                  .times(
                      Decimal.exp(
                          decimalT.times(21.875).dividedBy(decimalT.plus(265.5))
                      )
                  )
                  .toNumber()
            : new Decimal(610.5)
                  .times(
                      Decimal.exp(
                          decimalT.times(17.269).dividedBy(decimalT.plus(237.3))
                      )
                  )
                  .toNumber();
    });

    return { p_sat_i, p_sat_o };
};

// 수증기분압 및 차이 계산 함수
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
    const mHumi = data.map((value) => new Decimal(value.mHumi));
    const wHumi = data.map((value) => new Decimal(value.wHumi));

    const pi = p_sat_i.map((p, i) =>
        new Decimal(p)
            .times(mHumi[i].dividedBy(100))
            .toDecimalPlaces(2)
            .toNumber()
    );
    const po = p_sat_o.map((p, i) =>
        new Decimal(p)
            .times(wHumi[i].dividedBy(100))
            .toDecimalPlaces(2)
            .toNumber()
    );
    const pdiff = pi.map((p, i) =>
        new Decimal(p).minus(po[i]).toDecimalPlaces(2).toNumber()
    );

    return {
        pi,
        po,
        p_sat_i: p_sat_i.map((p) =>
            new Decimal(p).toDecimalPlaces(2).toNumber()
        ),
        p_sat_o: p_sat_o.map((p) =>
            new Decimal(p).toDecimalPlaces(2).toNumber()
        ),
        pdiff,
    };
};
