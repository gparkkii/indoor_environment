'use client';

import React, { useState } from 'react';
import styles from './Nav.module.css';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { MENU } from '@/constants/menu';
import Logo from '@/assets/icons/house.svg';
import Image from 'next/image';

export default function Nav() {
    const segment = useSelectedLayoutSegment();

    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={styles.layout}>
            <Link href="/" className={styles.logo}>
                <Image src={Logo} alt="logo" width={40} height={40} />
            </Link>
            <ul className={styles.nav}>
                {Object.values(MENU).map(({ href, icon, title }) => {
                    return (
                        <li
                            key={href}
                            className={`${styles.list} ${segment === href || (!segment && !href) ? styles.active : ''}`}
                        >
                            <Link href={`/${href}`}>{isOpen && title}</Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
