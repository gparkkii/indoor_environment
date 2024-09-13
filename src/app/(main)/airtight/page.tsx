import React from 'react';
import styles from '../page.module.css';
import Chart from './_components/Chart';

export default function AirTightPage({
    searchParams: { min, max, avg },
}: {
    searchParams: {
        min?: string;
        max?: string;
        avg?: string;
    };
}) {
    return (
        <div className={styles.container}>
            {avg ? (
                <h3 className={styles.title}>
                    당신의 <b>기밀 성능</b>은
                    <br />
                    <strong>{avg}</strong>
                    <span>
                        &nbsp;h<sup>-1</sup>
                    </span>
                    &nbsp;&nbsp;입니다.
                </h3>
            ) : (
                '옵션을 선택해주세요.'
            )}
            <Chart />
        </div>
    );
}
