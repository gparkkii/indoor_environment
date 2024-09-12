import React from 'react';
import styles from './Radio.module.css';

interface RadioProps {
    checked: string | number;
    option: { label: string; value: string | number }[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Radio({ option, checked, onChange }: RadioProps) {
    return (
        <fieldset className={styles.radiobox}>
            {option.map(({ label, value }) => (
                <label key={value}>
                    <input
                        type="radio"
                        id={value.toString()}
                        value={value}
                        checked={checked === value}
                        onChange={onChange}
                    />
                    <span>{label}</span>
                </label>
            ))}
        </fieldset>
    );
}
