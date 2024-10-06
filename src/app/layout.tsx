import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Inter, Lato, Montserrat, Poppins, Rubik } from 'next/font/google';

const lato = Lato({
    weight: ['400', '700', '900'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--lato',
});
const inter = Poppins({
    weight: ['400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--inter',
});
const pretendard = localFont({
    src: '../assets/fonts/PretendardVariable.woff2',
    display: 'swap',
    weight: '45 920',
    variable: '--font-pretendard',
});

export const metadata: Metadata = {
    title: '실내 환경 진단',
    description: 'Generated by create next app',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${pretendard.variable} font-pretendard ${inter.className} ${lato.className}`}
            >
                <main>{children}</main>
            </body>
            <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
        </html>
    );
}
