import React, { useEffect, useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import Button from '../Button/Button';
import styles from './Address.module.css';
import CloseIcon from '@/assets/icons/cancel.svg';
import Image from 'next/image';

interface AddressProps {
    disabled?: boolean;
}

export default function Address({ disabled }: AddressProps) {
    const [open, setOpen] = useState(false);
    const onCompletePost = (data: any) => {
        console.log(data);
    };

    return (
        <div>
            <Button
                styleType="outlined"
                style={{ height: '44px', fontSize: '15px' }}
                disabled={disabled}
                onClick={() => {
                    setOpen(true);
                }}
            >
                주소로 가장 가까운 관측소 찾기
            </Button>
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
                                onComplete={onCompletePost}
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
