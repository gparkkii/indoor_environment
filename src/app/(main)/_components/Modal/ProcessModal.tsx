import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';
import styles from './ProcessModal.module.css';
import ResultIcon from '@/assets/icons/note.svg';
import Image from 'next/image';

interface ProcessModalProps {
    open: boolean;
    loading: boolean;
    process: string;
    onClose: () => void;
}

export default function ProcessModal({
    open,
    process,
    loading,
    onClose,
}: ProcessModalProps) {
    return (
        <Modal open={open}>
            <div className={styles.container}>
                {!loading && (
                    <div className={styles.header}>
                        <Image
                            src={ResultIcon}
                            width={36}
                            height={36}
                            alt="result"
                        />
                        <h3>계산 결과</h3>
                    </div>
                )}
                {loading ? (
                    <div className={styles.process}>
                        <div className={styles.loader} />
                        <h3 dangerouslySetInnerHTML={{ __html: process }} />
                    </div>
                ) : (
                    <div className={styles.process}>
                        <div className={styles.result}>
                            <p dangerouslySetInnerHTML={{ __html: process }} />
                        </div>
                    </div>
                )}
                {!loading && <Button onClick={onClose}>Close</Button>}
            </div>
        </Modal>
    );
}
