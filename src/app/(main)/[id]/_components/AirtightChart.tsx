'use client';

import dynamic from 'next/dynamic';
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

import styles from './Chart.module.css';
import { YEAR_OPTION } from '@/constants/option';
import { useWindowSize } from '@/hooks/useWindowSize';
import { breakpoints } from '@/constants/breakpoints';
import { useCallback } from 'react';

const L_SERIES = [
    {
        name: 'box',
        data: [
            {
                x: 1,
                y: [0, 0, 0, 0, 0],
            },
            {
                x: 2,
                y: [0, 0, 0, 0, 0],
            },
            {
                x: 3,
                y: [0, 0, 0, 0, 0],
            },
            {
                x: 4,
                y: [0.2, 0.5, 0.7, 1.0, 1.6],
            },
            {
                x: 5,
                y: [0.1, 0.4, 0.5, 0.7, 1.1],
            },
        ],
    },
];
const N_SERIES = [
    {
        name: 'box',
        data: [
            {
                x: 1,
                y: [1.4, 8.3, 12.6, 17.7, 31.8],
            },
            {
                x: 2,
                y: [1.9, 6.5, 8.1, 10.1, 15.4],
            },
            {
                x: 3,
                y: [2.0, 3.3, 6.2, 8.6, 13.9],
            },
            {
                x: 4,
                y: [1.3, 2.7, 3.6, 6.5, 12.1],
            },
            {
                x: 5,
                y: [0.3, 1.0, 1.4, 5.4, 12.1],
            },
        ],
    },
];

interface AirtightChartProps {
    avg?: number;
    year?: number;
    atype?: number;
}

export default function AirtightChart({
    avg,
    year,
    atype,
}: AirtightChartProps) {
    const { width } = useWindowSize();
    // const OUTLIERS = useMemo(() => ({ name: 'outliers', type: 'scatter', data: [{x: Number(year), y: Number(avg)}]}), [year, avg])

    const getChartOptions = useCallback((): ApexCharts.ApexOptions => {
        const xl = width && Number(width) > breakpoints.values.xl;
        const lg = width && Number(width) > breakpoints.values.lg;
        return {
            chart: {
                toolbar: {
                    show: false,
                    autoSelected: undefined,
                },
                zoom: {
                    enabled: false,
                },
            },
            legend: {
                show: false,
            },
            xaxis: {
                type: 'category',
                tooltip: {
                    enabled: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    formatter: (val: string) => {
                        const label = YEAR_OPTION.find(
                            ({ value }) => value === Number(val)
                        )?.label.toString();
                        return label ?? '---';
                    },
                    style: {
                        colors: '#64748b',
                    },
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#64748b',
                    },
                },
                tooltip: {
                    enabled: false,
                },
            },
            plotOptions: {
                bar: {
                    columnWidth: xl ? 80 : lg ? 64 : 20,
                },
            },
            annotations: {
                points: [
                    {
                        x: year,
                        y: avg,
                        marker: {
                            size: 3,
                            strokeWidth: 1.5,
                            strokeColor: '#000',
                            fillColor: '#fff',
                        },
                        label: {
                            text: avg?.toFixed(1),
                            orientation: 'horizontal',
                            borderColor: '#000',
                            borderWidth: 1,
                            borderRadius: 3,
                            style: {
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#ff5f77',
                            },
                        },
                    },
                ],
                xaxis: [
                    {
                        x: year,
                        borderWidth: xl ? 100 : lg ? 84 : 40,
                        strokeDashArray: 0,
                        borderColor: '#ff6f851a',
                    },
                ],
            },
            tooltip: {
                enabled: false,
                shared: false,
                intersect: true,
                custom: function ({ w, dataPointIndex }) {
                    const series = w.config.series[0].data[dataPointIndex];
                    return (
                        '<div class="chart_tooltip">' +
                        '<span>' +
                        'min: ' +
                        series.y[0] +
                        '<br/>' +
                        'avg: ' +
                        series.y[2] +
                        '<br/>' +
                        'max: ' +
                        series.y[4] +
                        '</span>' +
                        '</div>'
                    );
                },
            },
        };
    }, [width, avg, year, atype]);

    return (
        <div className={styles.container}>
            <div className={styles.chartbox}>
                <label>
                    준공연도별 기밀성능 범위 (단위: h<sup>-1</sup> ACH@50Pa)
                </label>
                <ApexChart
                    type="boxPlot"
                    series={atype === 1 ? N_SERIES : L_SERIES}
                    options={getChartOptions()}
                    height="80%"
                />
            </div>
        </div>
    );
}
