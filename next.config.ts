import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./docs/ppt/**/*"],
  },
};

export default nextConfig;
