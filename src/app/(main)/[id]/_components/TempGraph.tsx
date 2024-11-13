'use client';

import React, { useEffect, useState } from 'react';
import styles from './Chart.module.css';
import dynamic from 'next/dynamic';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

// Linear function to calculate slope and intercept
const linearFunction = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number
) => {
    const slope = (y2 - y1) / (x2 - x1);
    const intercept = y1 - slope * x1;
    return slope * x + intercept;
};

interface TempGraphProps {
    coordinate_1: number[];
    coordinate_2: number[];
}

const TempGraph = ({ coordinate_1, coordinate_2 }: TempGraphProps) => {
    const [series, setSeries] = useState<any[]>([]);

    useEffect(() => {
        // x 축 범위를 0에서 30까지 설정
        const xValues = Array.from({ length: 31 }, (_, i) => i); // 0 ~ 30까지 x 값

        // 결과를 저장할 배열
        const t_i_ISO: number[] = [];

        // 각 x 값에 대해 y 값 계산 및 추가
        xValues.forEach((i) => {
            if (i <= coordinate_1[0]) {
                t_i_ISO.push(coordinate_1[1]);
            } else if (i >= coordinate_2[0]) {
                t_i_ISO.push(coordinate_2[1]);
            } else {
                // 범위 내의 경우 linearFunction 호출
                t_i_ISO.push(
                    linearFunction(
                        coordinate_1[0],
                        coordinate_1[1],
                        coordinate_2[0],
                        coordinate_2[1],
                        i
                    )
                );
            }
        });

        setSeries([{ name: 'ISO standard', data: t_i_ISO }]);
    }, [coordinate_1, coordinate_2]);

    const options: ApexCharts.ApexOptions = {
        chart: {
            toolbar: {
                show: false,
                autoSelected: undefined,
            },
            zoom: {
                enabled: false,
            },
            fontFamily: 'Pretendard',
        },
        colors: ['#ff6f85'],
        stroke: {
            curve: 'straight',
            width: 6,
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#94a3b8',
                },
                formatter: (value) => value.toFixed(1),
            },
            tickAmount: 6,
        },
        xaxis: {
            title: {
                text: 't_o',
                style: {
                    fontFamily: 'Pretendard',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1e293b',
                },
            },
            categories: Array.from({ length: 31 }, (_, i) => i.toString()),
            labels: {
                style: {
                    colors: '#94a3b8',
                },
                formatter: (value) => (parseInt(value) % 5 === 0 ? value : ''),
            },
            tooltip: {
                formatter: (value) => (Number(value) - 1).toFixed(0),
            },
        },
        grid: {
            borderColor: '#dfe1e5',
            strokeDashArray: 5,
        },
        title: {
            text: 'Indoor Living Temperature Chart',
            style: {
                fontFamily: 'Pretendard',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1e293b',
            },
            align: 'center',
        },
    };

    return (
        <div className={styles.temp}>
            <ApexCharts
                options={options}
                series={series}
                type="line"
                height={500}
            />
        </div>
    );
};

export default TempGraph;
