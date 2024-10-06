import React, { useEffect, useRef, useState } from 'react';
import styles from './UploadFile.module.css';
import Image from 'next/image';
import CsvIcon from '@/assets/icons/csv.svg';
import DeleteIcon from '@/assets/icons/delete.svg';

interface UploadFileProps {
    file: File | null;
    handleFile: (file: File) => void;
    deleteFile: () => void;
    getSampleFile: () => void;
}

export default function UploadFile({
    file,
    handleFile,
    deleteFile,
    getSampleFile,
}: UploadFileProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSample = async () => {
        await getSampleFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = () => {
        deleteFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.filebox}>
            <div className={styles['file-row']}>
                {file ? (
                    <>
                        <div className={styles.file}>
                            <Image
                                src={CsvIcon}
                                alt="csv"
                                width={22}
                                height={22}
                            />
                            {file.name}
                        </div>
                        <button
                            className={styles.delete}
                            type="button"
                            onClick={handleDelete}
                        >
                            <Image
                                src={DeleteIcon}
                                alt="csv"
                                width={10}
                                height={10}
                            />
                        </button>
                    </>
                ) : (
                    <p>파일을 선택해주세요.</p>
                )}
            </div>
            <div className={styles['button-box']}>
                <label htmlFor="upload-file">파일 불러오기</label>
                <button type="button" onClick={handleSample}>
                    샘플 데이터
                </button>
            </div>
            <input
                ref={fileInputRef}
                id="upload-file"
                type="file"
                accept=".csv"
                onChange={(e) => {
                    if (e.target.files) {
                        handleFile(e.target.files[0]);
                    }
                }}
            />
        </div>
    );
}
