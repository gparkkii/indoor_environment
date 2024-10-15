import React from 'react';
import styles from './SelectedFile.module.css';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import DeleteIcon from '@/assets/icons/delete.svg';
import SearchIcon from '@/assets/icons/search.svg';

interface SelectedFileProps {
    htmlFor: string;
    filename?: string | null;
    placeholder?: string;
    icon: string | StaticImport;
    handleDelete: () => void;
    onClick?: () => void;
    disabled?: boolean;
}

export default function SelectedFile({
    htmlFor,
    filename,
    placeholder,
    icon,
    handleDelete,
    onClick,
    disabled,
}: SelectedFileProps) {
    return (
        <>
            {filename ? (
                <div className={styles['file-row']}>
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
                </div>
            ) : (
                <label
                    htmlFor={htmlFor}
                    className={`${styles['file-row']} ${disabled && styles.disabled}`}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                    onClick={() => !disabled && onClick?.()}
                >
                    {placeholder ?? '파일을 선택해주세요.'}
                    <Image
                        style={{ opacity: disabled ? 0.35 : 1 }}
                        src={SearchIcon}
                        alt="csv"
                        width={20}
                        height={20}
                    />
                </label>
            )}
        </>
    );
}
