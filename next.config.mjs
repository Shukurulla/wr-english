/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://wr-server.kerek.uz/api/:path*"
      },
      {
        source: "/uploads/:path*",
        destination: "https://wr-server.kerek.uz/uploads/:path*"
      }
    ];
  }
};

export default nextConfig;
