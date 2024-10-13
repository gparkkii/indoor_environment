import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    open: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

export default function Modal({ open, children }: ModalProps) {
    return (
        open && (
            <div className={styles.modal}>
                <div className={styles.wrapper}>{children}</div>
            </div>
        )
    );
}
