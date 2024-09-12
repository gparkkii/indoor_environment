'use client';

import React, { useState } from 'react';
import styles from './Nav.module.css';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { MENU } from '@/constants/menu';

export default function Nav() {
    const segment = useSelectedLayoutSegment();

    const [isOpen, setIsOpen] = useState(true);

    return (
        <div
            className={styles.layout}
            style={{ width: isOpen ? '100%' : '64px' }}
        >
            <div className={styles.header}>
                {isOpen ? 'INOOR ENVIRONMENT' : '+'}
            </div>
            <ul className={styles.nav}>
                {MENU.map(({ href, icon, title }) => (
                    <li
                        className={`${styles.list} ${segment === href ? styles.active : ''}`}
                    >
                        <Link href={`/${href}`}>
                            {icon()}
                            {isOpen && title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
