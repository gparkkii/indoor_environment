'use client';

import React, { useCallback, useEffect, useState } from 'react';
import styles from './Drawer.module.css';
import { MENU } from '@/constants/menu';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import Radio from '../Radio/Radio';
import TextInput from '../TextInput/TextInput';
import Button from '../Button/Button';
import getAirtightness from '@/actions/airtightness';
import getLighting from '@/actions/lighting';
import {
    BUILDING_OPTION,
    BUILDING_TYPE_OPTION,
    YEAR_OPTION,
} from '@/constants/option';

const InputBox = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => {
    return (
        <div className={styles.inputbox}>
            <label>{label}</label>
            {children}
        </div>
    );
};

export default function Drawer() {
    const router = useRouter();
    const segment = useSelectedLayoutSegment() as keyof typeof MENU;

    const [buildingType, setBuildingType] = useState<BuildingType.value>(1);
    const [year, setYear] = useState<Year.value>(1);
    const [airtight, setAirtight] = useState('');

    useEffect(() => {
        setBuildingType(1);
        setYear(1);
        setAirtight('');
    }, [segment]);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (segment === 'temperature') {
                // TODO: API 요청
            }
            if (segment === 'lighting') {
                const res = getLighting({ year, buildingType });
                if (res) {
                    router.push(
                        `/${segment}?avg=${res?.avg}&year=${year}&type=${buildingType}`
                    );
                }
            }
            if (segment === 'airtight') {
                const res = getAirtightness({
                    year,
                    airtight,
                });
                if (res) {
                    router.push(
                        `/${segment}?min=${res.min}&max=${res.max}&avg=${res?.avg}`
                    );
                }
            }
        },
        [year, buildingType, airtight, segment]
    );

    return (
        <div
            className={styles.layout}
            style={{ display: segment ? 'flex' : 'none' }}
        >
            <div className={styles.headerbox}>
                <div className={styles.header}>실내 환경 진단</div>
                <div className={styles.subheader}>
                    {MENU[segment]?.title ?? ''}
                </div>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div>
                    {(segment === 'temperature' || segment === 'lighting') && (
                        <InputBox label="건물용도 선택">
                            <Radio
                                checked={buildingType}
                                option={BUILDING_TYPE_OPTION}
                                onChange={(e) =>
                                    setBuildingType(
                                        Number(
                                            e.target.value
                                        ) as unknown as BuildingType.value
                                    )
                                }
                            />
                        </InputBox>
                    )}
                    {(segment === 'airtight' || segment === 'lighting') && (
                        <InputBox label="준공연도 선택">
                            <Radio
                                checked={year}
                                option={YEAR_OPTION}
                                onChange={(e) =>
                                    setYear(
                                        Number(
                                            e.target.value
                                        ) as unknown as Year.value
                                    )
                                }
                            />
                        </InputBox>
                    )}
                    {segment === 'airtight' && (
                        <InputBox label="건물 선택">
                            <Radio checked={1} option={BUILDING_OPTION} />
                        </InputBox>
                    )}
                    {segment === 'airtight' && (
                        <InputBox label="기밀 성능 값">
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
                        </InputBox>
                    )}
                </div>
                <Button type="submit">진단하기</Button>
            </form>
        </div>
    );
}
