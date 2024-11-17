'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './Chart.module.css';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const HUMIDITY_CLASS: Record<number, number> = {
    5: 1360,
    4: 1080,
    3: 810,
    2: 640,
    1: 270,
};

const HUMIDITY_CLASS_COLOR: Record<number, string> = {
    1: '#A78BFA',
    2: '#FB7185',
    3: '#FACC15',
    4: '#34D399',
    5: '#3B82F6',
};

const HUMIDITY_CLASS_COLOR_EMPHASIS: Record<number, string> = {
    1: '#7C3AED',
    2: '#F43F5E',
    3: '#EAB308',
    4: '#10B981',
    5: '#2563EB',
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

interface HunidityGraphProps {
    selectedClass?: number;
}

const HumidityGraph = ({ selectedClass = 1 }: HunidityGraphProps) => {
    const [series, setSeries] = useState<any[]>([]);

    useEffect(() => {
        // 좌표 클래스 정의 (각 좌표를 [x, y] 형식의 튜플로 설정)
        const coordinateClasses: [number, number][][] = [
            [
                [0, 1360],
                [20, 200],
            ],
            [
                [0, 1080],
                [20, 100],
            ],
            [
                [0, 810],
                [20, 100],
            ],
            [
                [0, 640],
                [20, 100],
            ],
            [
                [0, 270],
                [20, 100],
            ],
        ];

        const x_values = Array.from({ length: 36 }, (_, i) => i - 5); // -5부터 30까지의 x 값
        const seriesData: any[] = [];

        // 각 좌표 클래스에 대해 그래프 데이터를 계산
        coordinateClasses.forEach((coordinateClass, i) => {
            const p_diff_ISO: number[] = [];

            for (let j = 0; j < coordinateClass.length - 1; j++) {
                const [x1, y1] = coordinateClass[j];
                const [x2, y2] = coordinateClass[j + 1];

                x_values.forEach((x_value) => {
                    if (x_value <= x1) {
                        p_diff_ISO.push(y1);
                    } else if (x_value >= x2) {
                        p_diff_ISO.push(y2);
                    } else {
                        p_diff_ISO.push(
                            linearFunction(x1, y1, x2, y2, x_value)
                        );
                    }
                });
            }

            // 구간별 데이터 시리즈 추가
            seriesData.push({
                name: `Class ${5 - i}`,
                data: p_diff_ISO,
                type: 'line',
            });
        });

        setSeries(seriesData);
    }, [selectedClass]);

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
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            enabledOnSeries: [0, 1, 2, 3, 4],
        },
        stroke: {
            curve: 'straight',
            colors: Object.values(HUMIDITY_CLASS_COLOR).map((v, i) =>
                5 - i === selectedClass
                    ? HUMIDITY_CLASS_COLOR_EMPHASIS[5 - i]
                    : HUMIDITY_CLASS_COLOR[5 - i]
            ),
            width: Object.keys(HUMIDITY_CLASS_COLOR).map((key, i) =>
                5 - i === selectedClass ? 6 : 3
            ),
        },
        xaxis: {
            title: {
                text: '실외온도 [℃]',
                style: {
                    fontFamily: 'Pretendard',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1e293b',
                },
            },
            categories: Array.from({ length: 36 }, (_, i) => i - 5), // 실제 36개의 x값은 그대로 유지
            labels: {
                style: {
                    colors: '#64748b',
                },
                formatter: (value: string) =>
                    Number(value) % 5 === 0 ? value.toString() : '',
            },
            tooltip: {
                formatter: (value) => (Number(value) - 1).toFixed(0),
            },
        },
        yaxis: {
            title: {
                text: '수증기분압차 ΔP [Pa]',
                style: {
                    fontFamily: 'Pretendard',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1e293b',
                },
            },
            labels: {
                style: {
                    colors: '#64748b',
                },
            },
            decimalsInFloat: 0,
            min: 0,
            max: 1600,
            tickAmount: 8,
        },
        legend: {
            customLegendItems: [
                'Class 5',
                'Class 4',
                'Class 3',
                'Class 2',
                'Class 1',
            ],
            markers: {
                size: 6,
                offsetX: -4,
            },
            height: 48,
            fontWeight: 500,
            horizontalAlign: 'center',
            itemMargin: { horizontal: 12 },
            position: 'bottom',
        },
        grid: {
            borderColor: '#dfe1e5',
            strokeDashArray: 5,
        },
        title: {
            text: '습도등급',
            style: {
                fontFamily: 'Pretendard',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1e293b',
            },
            align: 'center',
        },
        annotations: {
            points: [
                {
                    x: 2,
                    y: HUMIDITY_CLASS[selectedClass],
                    marker: {
                        size: 0,
                        fillColor: '#fff',
                    },
                    label: {
                        borderColor: '#202020',
                        offsetY: 30,
                        offsetX: 25,
                        style: {
                            color: '#fff',
                            background:
                                HUMIDITY_CLASS_COLOR_EMPHASIS[selectedClass],
                        },
                        text: `Class ${selectedClass}`,
                    },
                },
            ],
        },
    };

    return (
        <div className={styles.humidity}>
            <div className={styles['humidity-class']}>
                <h5>Internal humidity classes</h5>
                <table>
                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Building</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>5</td>
                            <td>
                                Special buildings, for example, laundry, brewery
                                and swimming pool
                            </td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>Sports halls, kitchens and canteens</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>Buildings with unknown occupancy</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>
                                Offices, dwellings with normal occupancy and
                                ventilation
                            </td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Unoccupied buildings, storage of dry goods</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <ApexCharts
                series={series}
                options={options}
                type="line"
                height={560}
            />
        </div>
    );
};

export default HumidityGraph;
