'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './Drawer.module.css';
import { MENU } from '@/constants/menu';
import {
    useRouter,
    useSearchParams,
    useSelectedLayoutSegment,
} from 'next/navigation';
import Radio from '../Radio/Radio';
import TextInput from '../TextInput/TextInput';
import Button from '../Button/Button';
import getAirtightness from '@/actions/airtightness';
import getLighting from '@/actions/lighting';
import { processFile } from '@/actions/temperature/csv';
import {
    BUILDING_OPTION,
    BUILDING_TYPE_OPTION,
    YEAR_OPTION,
} from '@/constants/option';
import UploadFile from '../UploadFile/UploadFile';
import Address from '../Address/Address';
import { getGeocoder } from '@/actions/temperature/address';
import ProcessModal from '../Modal/ProcessModal';

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

    const searchParams = useSearchParams();
    const yearIndex = searchParams.get('year');
    const typeIndex = searchParams.get('type');
    const atypeIndex = searchParams.get('atype');
    const aText = searchParams.get('a');

    // temperature
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [process, setProcess] = useState('');
    const [isSampleFile, setIsSampleFile] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [observatory, setObservatory] = useState<string | null>(null);

    const [buildingType, setBuildingType] = useState<BuildingType.value>(1);
    const [aBuildingType, setABuildingType] = useState<ABuildingType.value>(1);
    const [year, setYear] = useState<Year.value>(1);
    const [airtight, setAirtight] = useState('');

    // temperature disabled
    const disabled = useMemo(
        () =>
            segment === 'temperature' &&
            !isSampleFile &&
            (!file || !observatory),
        [segment, isSampleFile, file, observatory]
    );

    useEffect(() => {
        let year: Year.value = 1;
        let type: BuildingType.value = 1;
        let atype: ABuildingType.value = 1;
        let a = '';
        if (yearIndex) {
            year = Number(yearIndex) as Year.value;
        }
        if (typeIndex) {
            type = Number(typeIndex) as BuildingType.value;
        }
        if (atypeIndex) {
            atype = Number(atypeIndex) as ABuildingType.value;
        }
        if (aText) {
            a = aText;
        }
        setYear(year);
        setBuildingType(type);
        setABuildingType(atype);
        setAirtight(a);
    }, [segment, yearIndex, typeIndex, atypeIndex, aText]);

    useEffect(() => {
        if (
            segment === 'airtight' &&
            aBuildingType === 2 &&
            [1, 2, 3].includes(year)
        ) {
            setYear(4);
        }
    }, [year, aBuildingType, segment]);

    // temperature -> file
    const getSampleFile = async () => {
        try {
            const response = await fetch('/assets/files/sample.csv');
            const blob = await response.blob();
            const newFile = new File([blob], 'sample.csv', {
                type: 'text/csv',
            });
            setFile(newFile);
            setObservatory(null);
            setIsSampleFile(true);
        } catch (error) {
            console.error('Error fetching the sample file:', error);
            alert('샘플 파일을 불러올 수 없습니다.');
        }
    };
    const handleFile = (file: File) => {
        setFile(file);
        setIsSampleFile(false);
    };
    const deleteFile = () => {
        setFile(null);
        setIsSampleFile(false);
    };

    // temperature -> location
    const handleAddress = async (data: any) => {
        const geocoder = await getGeocoder(data.address);
        if (geocoder) {
            setObservatory(`${geocoder?.location}(${geocoder.id})`);
        } else {
            alert('관측소를 불러올 수 없습니다.');
        }
    };
    const deleteAddress = () => {
        setObservatory(null);
    };

    useEffect(() => {
        if (segment === 'temperature') {
            if (isSampleFile) {
                setObservatory(null);
            }
            setBuildingType(
                (isSampleFile ? 0 : 1) as unknown as BuildingType.value
            );
        }
    }, [segment, isSampleFile]);

    function extractNumber(input: string): number | null {
        const match = input.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (segment === 'temperature') {
                if (file) {
                    setOpen(true);
                    setLoading(true);
                    const geocoder = observatory
                        ? extractNumber(observatory)
                        : null;
                    const result = await processFile(file, setProcess, geocoder);
                    if (result !== null) {
                        setOpen(false);
                        let url = `/${segment}?result=${encodeURI(JSON.stringify(result))}`;
                        if (buildingType) {
                            url += `&type=${buildingType}`;
                        }
                        router.push(url);
                    }
                    setLoading(false);
                }
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
                    atype: aBuildingType,
                });
                if (res) {
                    router.push(
                        `/${segment}?avg=${res?.avg}&year=${year}&a=${airtight}&atype=${aBuildingType}`
                    );
                }
            }
        },
        [
            year,
            buildingType,
            airtight,
            aBuildingType,
            segment,
            file,
            observatory,
        ]
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
                    {segment === 'temperature' && (
                        <InputBox label="측정데이터 선택">
                            <UploadFile
                                file={file}
                                handleFile={handleFile}
                                deleteFile={deleteFile}
                                getSampleFile={getSampleFile}
                            />
                        </InputBox>
                    )}
                    {segment === 'temperature' && (
                        <InputBox label="측정 위치 선택">
                            <Address
                                observatory={observatory}
                                handleAddress={handleAddress}
                                handleDelete={deleteAddress}
                                disabled={
                                    segment === 'temperature' && isSampleFile
                                }
                            />
                        </InputBox>
                    )}
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
                                disableOption={
                                    segment === 'temperature' && isSampleFile
                                        ? [1, 2, 3]
                                        : undefined
                                }
                            />
                        </InputBox>
                    )}
                    {(segment === 'airtight' || segment === 'lighting') && (
                        <InputBox label="준공연도 선택">
                            <Radio
                                checked={year}
                                option={YEAR_OPTION}
                                disableOption={
                                    segment === 'airtight' &&
                                    aBuildingType === 2
                                        ? [1, 2, 3]
                                        : undefined
                                }
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
                            <Radio
                                checked={aBuildingType}
                                option={BUILDING_OPTION}
                                onChange={(e) =>
                                    setABuildingType(
                                        Number(
                                            e.target.value
                                        ) as unknown as ABuildingType.value
                                    )
                                }
                            />
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
                                step="0.1"
                            />
                        </InputBox>
                    )}
                </div>
                <Button type="submit" disabled={disabled}>
                    진단하기
                </Button>
            </form>
            <ProcessModal
                open={open}
                process={process}
                loading={loading}
                onClose={() => {
                    setOpen(false);
                }}
            />
        </div>
    );
}
