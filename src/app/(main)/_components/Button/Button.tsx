import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    styleType?: 'primary' | 'outlined';
    disabled?: boolean;
    children: React.ReactNode;
}

export default function Button({
    styleType,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            type="button"
            className={
                styleType === 'outlined' ? styles.outlined : styles.primary
            }
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
