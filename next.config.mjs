/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8847/api/:path*",
        // destination: "https://wr-server.kerek.uz/api/:path*"
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8847/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
