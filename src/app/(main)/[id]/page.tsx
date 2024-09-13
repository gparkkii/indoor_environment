import React from 'react';
import styles from '../page.module.css';
import { MENU } from '@/constants/menu';
import AirtightChart from './_components/AirtightChart';
import LightingChart from './_components/LightingChart';
import TemperatureChart from './_components/TemperatureChart';

export default function DetailPage({
    params: { id },
    searchParams: { min, max, avg },
}: {
    params: { id: keyof typeof MENU };
    searchParams: {
        min?: string;
        max?: string;
        avg?: string;
    };
}) {
    return (
        <div className={styles.container}>
            {avg && id ? (
                <>
                    <h3 className={styles.title}>
                        당신의 <b>{MENU[id].title}</b>
                        {MENU[id].href === 'airtight' ? '은' : '는'}&nbsp;&nbsp;
                        <br />
                        <span className={styles.emphasize}>
                            <strong>{avg}</strong>
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
                        &nbsp;&nbsp;입니다.
                    </h3>
                    {MENU[id].href === 'temperature' && <TemperatureChart />}
                    {MENU[id].href === 'lighting' && <LightingChart />}
                    {MENU[id].href === 'airtight' && <AirtightChart />}
                </>
            ) : (
                '옵션 선택 후 진단하기 버튼을 눌러주세요.'
            )}
        </div>
    );
}
