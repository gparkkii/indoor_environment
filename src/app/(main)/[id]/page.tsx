import React from 'react';
import styles from '../page.module.css';
import Chart from './_components/Chart';
import { MENU } from '@/constants/menu';

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
                            <span>
                                &nbsp;h<sup>-1</sup>
                            </span>
                        </span>
                        &nbsp;&nbsp;입니다.
                    </h3>
                    <Chart />
                </>
            ) : (
                '옵션 선택 후 진단하기 버튼을 눌러주세요.'
            )}
        </div>
    );
}
