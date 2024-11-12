/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
            source: "/api/:path*",
            destination: "https://api.vworld.kr/req/:path*",
            },
        ];
    }
};

export default nextConfig;
