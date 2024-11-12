/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
            source: "/api/:path*",
            destination: "https://api.vworld.kr/req/:path*",
            },
            {
                source: "/api/wthr/:path*",
                destination: "http://apis.data.go.kr/:path*",
            },
        ];
    }
};

export default nextConfig;
