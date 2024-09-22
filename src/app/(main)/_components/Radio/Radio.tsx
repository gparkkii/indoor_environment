import React from 'react';
import styles from './Radio.module.css';

interface RadioProps {
    checked: string | number;
    option: { label: string; value: string | number }[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disableOption?: Array<string | number>
}

export default function Radio({ option, checked, onChange, disableOption }: RadioProps) {
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
                        disabled={disableOption? disableOption.includes(value) : false}
                    />
                    <span>{label}</span>
                </label>
            ))}
        </fieldset>
    );
}
