import type { NextConfig } from "next";

const configuredBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
const basePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const shouldExportStatic = process.env.NEXT_OUTPUT_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  ...(shouldExportStatic ? { output: "export" } : {}),
  images: { unoptimized: true },
  allowedDevOrigins: ['home.catoyeung.com']
};

export default nextConfig;
