import type { NextConfig } from "next";
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  env: {
    deepl: process.env.DEEPL_API_KEY,
  },
};

export default nextConfig;
