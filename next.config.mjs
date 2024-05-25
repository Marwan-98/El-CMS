import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/services/i18n/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ar/search",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
