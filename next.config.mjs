import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Every page is prerendered, so the deploy artifact is a plain file tree. `next start`
  // stops working with this on: preview a build with `npx wrangler pages dev out`.
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // There are stray lockfiles in parent directories; pin the tracing root to this project.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};
export default nextConfig;
