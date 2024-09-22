import React, { Suspense } from 'react';
import styles from './layout.module.css';
import Nav from './_components/Nav/Nav';
import Drawer from './_components/Drawer/Drawer';

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={styles.layout}>
            <Nav />
            <Suspense fallback={null}>
                <Drawer />
            </Suspense>
            {children}
        </div>
    );
}
