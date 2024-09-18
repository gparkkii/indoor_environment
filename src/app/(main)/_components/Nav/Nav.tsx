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
            <Link href="/" className={styles.header}>
                {isOpen ? 'INOOR ENVIRONMENT' : '+'}
            </Link>
            <ul className={styles.nav}>
                {Object.values(MENU).map(({ href, icon, title }) => {
                    return (
                        <li
                            key={href}
                            className={`${styles.list} ${segment === href ? styles.active : ''}`}
                        >
                            <Link
                                href={href === 'temperature' ? '' : `/${href}`}
                                aria-description="준비중"
                            >
                                {icon()}
                                {isOpen && title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
