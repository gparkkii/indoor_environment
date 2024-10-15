'use client';

import React from 'react';
import styles from './Chart.module.css';
import { useSearchParams } from 'next/navigation';

interface LightingData {
    type: string;
    values: {
        range: string;
        average: number;
    }[];
}

const lightingData: LightingData[] = [
    {
        type: '주거용',
        values: [
            { range: '2.0 ~ 4.1', average: 3.4 },
            { range: '2.1 ~ 4.2', average: 3.4 },
            { range: '1.9 ~ 3.9', average: 3.3 },
            { range: '2.0 ~ 4.2', average: 3.4 },
        ],
    },
    {
        type: '상업용',
        values: [
            { range: '2.4 ~ 7.4', average: 5.4 },
            { range: '2.4 ~ 6.3', average: 4.8 },
            { range: '2.5 ~ 6.0', average: 4.8 },
            { range: '2.9 ~ 6.3', average: 5.1 },
        ],
    },
    {
        type: '교육사회용',
        values: [
            { range: '2.4 ~ 5.9', average: 4.7 },
            { range: '2.8 ~ 6.3', average: 4.9 },
            { range: '3.0 ~ 7.0', average: 5.4 },
            { range: '3.1 ~ 7.2', average: 5.7 },
        ],
    },
];

const BUILDING = ['주거용', '상업용', '교육사회용'];

export default function LightingChart() {
    const searchParams = useSearchParams();
    const yearIndex = searchParams.get('year');
    const buildingType = searchParams.get('type');

    const getClassName = (year: number, type: string) => {
        if (yearIndex && buildingType) {
            return year === Number(yearIndex) - 1 &&
                type === BUILDING[Number(buildingType) - 1]
                ? styles.highlight
                : '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.chartbox}>
                <label style={{ marginTop: 40 }}>
                    준공연도별 조명밀도 범위 (단위: W/m<sup>2</sup>)
                </label>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th rowSpan={3}>구분</th>
                            <th colSpan={8}>준공연도</th>
                        </tr>
                        <tr>
                            <th colSpan={2}>1987년 이전</th>
                            <th colSpan={2}>1988 ~ 2000</th>
                            <th colSpan={2}>2001 ~ 2010</th>
                            <th colSpan={2}>2011 ~ 2017</th>
                        </tr>
                        <tr>
                            <th>범위</th>
                            <th>평균</th>
                            <th>범위</th>
                            <th>평균</th>
                            <th>범위</th>
                            <th>평균</th>
                            <th>범위</th>
                            <th>평균</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lightingData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <th>{row.type}</th>
                                {row.values.map((value, valueIndex) => (
                                    <React.Fragment key={valueIndex}>
                                        <td>{value.range}</td>
                                        <td
                                            className={getClassName(
                                                valueIndex,
                                                row.type
                                            )}
                                        >
                                            {value.average}
                                        </td>
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.caption}>
                    * 주거용 건물 조명기기개수 출처:
                    국가에너지통계정보시스템,’가구에너지패널조사‘,2021
                    <br />
                    * 교육사회용, 상업용 건물 조명기기 개수 출처:
                    국가에너지통계정보시스템, ‘2020년 에너지총조사‘,2022
                    <br />* 조명소비전력 출처: 에너지관리공단,＇조명기기
                    이용현황 조사 및 보급기준 연구결과 보고서‘,2014
                </div>
            </div>
        </div>
    );
}
