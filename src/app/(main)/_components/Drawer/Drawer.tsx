'use client';

import React from 'react';
import styles from './Drawer.module.css';
import { MENU } from '@/constants/menu';
import { useSelectedLayoutSegment } from 'next/navigation';

export default function Drawer() {
    const segment = useSelectedLayoutSegment();
    return (
        <div className={styles.layout}>
            <div className={styles.headerbox}>
                <div className={styles.header}>실내 환경 진단</div>
                <div className={styles.subheader}>
                    {MENU.find(({ href }) => href === segment)?.title}
                </div>
            </div>
        </div>
    );
}
