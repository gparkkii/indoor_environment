import React from 'react';
import styles from './SelectedFile.module.css';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import DeleteIcon from '@/assets/icons/delete.svg';

interface SelectedFileProps {
    filename?: string | null;
    placeholder?: string;
    icon: string | StaticImport;
    handleDelete: () => void;
}

export default function SelectedFile({
    filename,
    placeholder,
    icon,
    handleDelete,
}: SelectedFileProps) {
    return (
        <div className={styles['file-row']}>
            {filename ? (
                <>
                    <div className={styles.file}>
                        <Image src={icon} alt="csv" width={22} height={22} />
                        <p>{filename}</p>
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
                <p>{placeholder ?? '파일을 선택해주세요.'}</p>
            )}
        </div>
    );
}
