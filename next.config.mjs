/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/admin/logique",
        destination: "/admin/workflow/scenarios",
        permanent: false,
      },
      {
        source: "/admin/logique/:id",
        destination: "/admin/workflow/scenarios/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
