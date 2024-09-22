import React, { InputHTMLAttributes } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    unit?: React.ReactNode;
}

export default function TextInput({
    value,
    onChange,
    disabled,
    placeholder,
    unit,
    ...props
}: TextInputProps) {
    return (
        <div className={styles.inputbox}>
            <input
                placeholder={placeholder ?? '텍스트를 입력해주세요.'}
                value={value}
                onChange={(e) => onChange(e)}
                disabled={disabled}
                {...props}
            />
            {unit && <div className={styles.unit}>{unit}</div>}
        </div>
    );
}
