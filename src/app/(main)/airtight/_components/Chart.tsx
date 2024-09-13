'use client';

import dynamic from 'next/dynamic';
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { COMPLETION_OPTION } from '@/constants/option';
import styles from './Chart.module.css';

const SERIES = [
    {
        name: 'box',
        data: [
            {
                x: 1,
                y: [8.8, 12.15, 14.5, 16.1, 17.7],
            },
            {
                x: 2,
                y: [6.6, 9.05, 11.5, 13.8, 16.1],
            },
            {
                x: 3,
                y: [4.4, 5.65, 6.9, 9.2, 11.5],
            },
            {
                x: 4,
                y: [2.4, 3.0, 3.6, 4.7, 5.8],
            },
            {
                x: 5,
                y: [0, 0, 0, 0, 0],
            },
        ],
    },
];

export default function Chart() {
    return (
        <div className={styles.container}>
            <label>준공연도별 기밀성능 범위(단위: h-1 ACH@50Pa)</label>
            <div className={styles.chartbox}>
                <ApexChart
                    type="boxPlot"
                    series={SERIES}
                    options={{
                        chart: {
                            toolbar: {
                                show: false,
                                autoSelected: undefined,
                            },
                        },
                        xaxis: {
                            type: 'category',
                            tooltip: {
                                enabled: false,
                            },
                            labels: {
                                formatter: (val: string) => {
                                    const label = COMPLETION_OPTION.find(
                                        ({ value }) => value === Number(val)
                                    )?.label.toString();
                                    return label ?? '---';
                                },
                                style: {
                                    colors: '#64748b',
                                },
                            },
                        },
                        tooltip: {
                            shared: false,
                            intersect: true,
                        },
                    }}
                    width={700}
                    height={500}
                />
            </div>
        </div>
    );
}
