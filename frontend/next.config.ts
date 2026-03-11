import type { NextConfig } from "next";
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  env: {
    deepl: process.env.DEEPL_API_KEY,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,

  },
};

export default nextConfig;
