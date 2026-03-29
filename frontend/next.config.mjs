import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker containerization
  // This creates a minimal, self-contained production build
  output: 'standalone',

  env: {
    N8N_TRANSLATE_WEBHOOK_URL: process.env.N8N_TRANSLATE_WEBHOOK_URL,
    N8N_QR_WEBHOOK_URL: process.env.N8N_QR_WEBHOOK_URL,
  },
};

export default nextConfig;
