'use client';

import React, { useCallback, useState } from 'react';
import styles from './Drawer.module.css';
import { MENU } from '@/constants/menu';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import Radio from '../Radio/Radio';
import TextInput from '../TextInput/TextInput';
import Button from '../Button/Button';
import getAirtightness from '@/actions/airtightness';

const COMPLETION_OPTION = [
    { label: '1987년 이전', value: 1 },
    { label: '1988 ~ 2000', value: 2 },
    { label: '2001 ~ 2010', value: 3 },
    { label: '2011 ~ 2017', value: 4 },
    { label: '2018년 이후', value: 5 },
];

const BUILDING_OPTION = [
    { label: '일반 건축물', value: 1 },
    // { label: '저에너지 건축물', value: 2 },
];

type YearType = 1 | 2 | 3 | 4 | 5;

export default function Drawer() {
    const router = useRouter();
    const segment = useSelectedLayoutSegment();

    const [year, setYear] = useState<YearType>(1);
    const [airtight, setAirtight] = useState('');

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            // TODO: API 요청
            const res = getAirtightness({
                year,
                airtight,
            });
            if (res) {
                router.push(
                    `/${segment}?min=${res.min}&max=${res.max}&avg=${res?.avg}`
                );
            }
        },
        [year, airtight]
    );

    return (
        <div className={styles.layout}>
            <div className={styles.headerbox}>
                <div className={styles.header}>실내 환경 진단</div>
                <div className={styles.subheader}>
                    {MENU.find(({ href }) => href === segment)?.title}
                </div>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div>
                    <div className={styles.inputbox}>
                        <label>준공연도 선택</label>
                        <Radio
                            checked={year}
                            option={COMPLETION_OPTION}
                            onChange={(e) =>
                                setYear(
                                    Number(
                                        e.target.value
                                    ) as unknown as YearType
                                )
                            }
                        />
                    </div>
                    <div className={styles.inputbox}>
                        <label>건물 선택</label>
                        <Radio checked={1} option={BUILDING_OPTION} />
                    </div>
                    <div className={styles.inputbox}>
                        <label>기밀 성능 값</label>
                        <TextInput
                            placeholder="기밀 성능 값"
                            type="number"
                            value={airtight}
                            onChange={(e) => setAirtight(e.target.value)}
                            unit={
                                <p>
                                    h<sup>-1</sup>
                                </p>
                            }
                        />
                    </div>
                </div>
                <Button type="submit">진단하기</Button>
            </form>
        </div>
    );
}
