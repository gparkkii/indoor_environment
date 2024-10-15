'use client';

import React, { useEffect, useState } from 'react';
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
    coordinate_1: [number, number];
    coordinate_2: [number, number];
}

const TempGraph = ({ coordinate_1, coordinate_2 }: TempGraphProps) => {
    const [series, setSeries] = useState<any[]>([]);

    useEffect(() => {
        // x 축 범위를 0에서 30까지 설정
        const x_values = Array.from({ length: 31 }, (_, i) => i);

        // t_i_ISO 값을 계산
        const t_i_ISO = x_values.map((x) => {
            if (x <= coordinate_1[0]) {
                return coordinate_1[1];
            } else if (x >= coordinate_2[0]) {
                return coordinate_2[1];
            } else {
                return linearFunction(
                    coordinate_1[0],
                    coordinate_1[1],
                    coordinate_2[0],
                    coordinate_2[1],
                    x
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
        <ApexCharts
            options={options}
            series={series}
            type="line"
            height={500}
        />
    );
};

export default TempGraph;
