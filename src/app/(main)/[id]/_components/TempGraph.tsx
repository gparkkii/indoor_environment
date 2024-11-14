'use client';

import React, { useCallback, useEffect, useState } from 'react';
import styles from './Chart.module.css';
import dynamic from 'next/dynamic';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const BASE_COORDINATE = {
    living: {
        coordinate_1: [12.2, 24],
        coordinate_2: [20.7, 28],
    },
    commercial: {
        coordinate_1: [7.8, 20],
        coordinate_2: [16.8, 26],
    },
    social: {
        coordinate_1: [9.1, 21],
        coordinate_2: [19.7, 27],
    },
};

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
        // x 축 범위 설정
        const xValues = Array.from({ length: 31 }, (_, i) => i);

        // y 값을 계산하는 linearFunction을 래핑하여 시리즈 데이터를 생성
        const getSeriesData = (
            coordinate_1: number[],
            coordinate_2: number[]
        ) => {
            return xValues.map((x) => {
                if (x <= coordinate_1[0]) return coordinate_1[1];
                if (x >= coordinate_2[0]) return coordinate_2[1];
                return linearFunction(
                    coordinate_1[0],
                    coordinate_1[1],
                    coordinate_2[0],
                    coordinate_2[1],
                    x
                );
            });
        };

        // 모든 표준 시리즈 데이터 생성
        const seriesData = [
            {
                name: 'ISO standard',
                data: getSeriesData(coordinate_1, coordinate_2),
            },
            {
                name: '주거용',
                data: getSeriesData(
                    BASE_COORDINATE.living.coordinate_1,
                    BASE_COORDINATE.living.coordinate_2
                ),
            },
            {
                name: '상업용',
                data: getSeriesData(
                    BASE_COORDINATE.commercial.coordinate_1,
                    BASE_COORDINATE.commercial.coordinate_2
                ),
            },
            {
                name: '사회용',
                data: getSeriesData(
                    BASE_COORDINATE.social.coordinate_1,
                    BASE_COORDINATE.social.coordinate_2
                ),
            },
        ];

        // 시리즈 상태 업데이트
        setSeries(seriesData);
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
        colors: ['#333333', '#4a90e2', '#50c878', '#ffd700'],
        stroke: {
            curve: 'straight',
            width: 4,
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
