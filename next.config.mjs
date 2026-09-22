import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // There are stray lockfiles in parent directories; pin the tracing root to this project.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};
export default nextConfig;
