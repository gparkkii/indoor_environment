import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import styles from './Address.module.css';
import CloseIcon from '@/assets/icons/cancel.svg';
import LocationIcon from '@/assets/icons/location.svg';
import Image from 'next/image';
import SelectedFile from '../SelectedFile/SelectedFile';

interface AddressProps {
    observatory?: string | null;
    handleDelete: () => void;
    handleAddress: (data: any) => void;
    disabled?: boolean;
}

export default function Address({
    observatory,
    handleDelete,
    handleAddress,
    disabled,
}: AddressProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.container}>
            <div className={styles.observatory}>
                <SelectedFile
                    htmlFor="address"
                    icon={LocationIcon}
                    filename={observatory}
                    handleDelete={handleDelete}
                    onClick={() => {
                        setOpen(true);
                    }}
                    placeholder="주소로 가장 가까운 관측소 찾기"
                    disabled={disabled}
                />
            </div>
            {open && (
                <div id="modal" className={styles.modal}>
                    <div className={styles.wrapper}>
                        <header className={styles.header}>
                            <p>도로명 찾기</p>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                <Image
                                    src={CloseIcon}
                                    alt="close"
                                    width={24}
                                    height={24}
                                />
                            </button>
                        </header>
                        <div className={styles.postcode}>
                            <DaumPostcode
                                autoClose
                                style={{ height: '500px' }}
                                theme={{
                                    bgColor: '#fff',
                                }}
                                onComplete={handleAddress}
                                onClose={() => {
                                    setOpen(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
