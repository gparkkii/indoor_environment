import React, { Suspense, useCallback } from 'react';
import styles from '../page.module.css';
import { MENU } from '@/constants/menu';
import AirtightChart from './_components/AirtightChart';
import LightingChart from './_components/LightingChart';
import TempGraph from './_components/TempGraph';
import HumidityGraph from './_components/HumidityGraph';
import { processResult } from '../../../actions/temperature/@types';
import { getHumidityClass } from '../../../utils/getHumidityClass';

export default function DetailPage({
    params: { id },
    searchParams: { avg, a, atype, year, result, btype, geocoder },
}: {
    params: { id: keyof typeof MENU };
    searchParams: {
        result?: string;
        avg?: string;
        a?: string;
        atype?: string;
        year?: string;
        btype?: string;
        geocoder?: string;
    };
}) {
    const {
        cHumi,
        cTemp,
        cTempIn,
        hHumi,
        hPDiff,
        hTemp,
        hTempIn,
    }: processResult = result ? JSON.parse(decodeURIComponent(result)) : {};

    return (
        <div className={styles.container}>
            <Suspense fallback={null}>
                {(id === 'temperature' && result) || (avg && id) ? (
                    <>
                        <h3 className={styles.title}>
                            당신의 <b>{MENU[id]?.title ?? '---'}</b>
                            {MENU[id].href === 'airtight' ? '은' : '는'}
                            &nbsp;&nbsp;
                            <br />
                            {MENU[id].href === 'temperature' ? (
                                <span>
                                    <span>난방&nbsp;&nbsp;</span>
                                    <span className={styles.emphasize}>
                                        <strong>{hTempIn.toFixed(1)}</strong>
                                        <span>&nbsp;ºC</span>
                                    </span>
                                    <span>&nbsp;,&nbsp;</span>
                                    <span>냉방&nbsp;&nbsp;</span>
                                    <span className={styles.emphasize}>
                                        <strong>{cTempIn.toFixed(1)}</strong>
                                        <span>&nbsp;ºC</span>
                                    </span>
                                    <br />
                                    <span>습도 등급은&nbsp;&nbsp;</span>
                                    <span className={styles.emphasize}>
                                        <strong>
                                            Class {getHumidityClass(hPDiff)}
                                        </strong>
                                    </span>
                                </span>
                            ) : (
                                <span className={styles.emphasize}>
                                    <strong>
                                        {a && !Number.isNaN(a)
                                            ? Number(a).toFixed(1)
                                            : avg}
                                    </strong>
                                    {MENU[id].href === 'lighting' && (
                                        <span>
                                            &nbsp;W/m<sup>2</sup>
                                        </span>
                                    )}
                                    {MENU[id].href === 'airtight' && (
                                        <span>
                                            &nbsp;h<sup>-1</sup>
                                        </span>
                                    )}
                                </span>
                            )}
                            &nbsp;&nbsp;입니다.
                        </h3>
                        {MENU[id].href === 'temperature' && (
                            <div className={styles['graph-container']}>
                                <div className={styles.tempGraphBox}>
                                    <TempGraph
                                        coordinate_1={[hTemp, hTempIn]}
                                        coordinate_2={[cTemp, cTempIn]}
                                    />
                                    <div style={{ height: 100 }} />
                                    <HumidityGraph
                                        selectedClass={getHumidityClass(hPDiff)}
                                    />
                                </div>
                            </div>
                        )}
                        {MENU[id].href === 'lighting' && <LightingChart />}
                        {MENU[id].href === 'airtight' && (
                            <AirtightChart
                                atype={atype ? Number(atype) : undefined}
                                year={year ? Number(year) : undefined}
                                avg={
                                    a
                                        ? Number(a)
                                        : avg
                                          ? Number(avg)
                                          : undefined
                                }
                            />
                        )}
                    </>
                ) : (
                    '옵션 선택 후 진단하기 버튼을 눌러주세요.'
                )}
            </Suspense>
        </div>
    );
}
