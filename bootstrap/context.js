import { CookieJar } from 'tough-cookie';

export const context = {
  baseUrl: process.env.N8N_URL || 'http://n8n:5678',
  jar: new CookieJar(),
  ownerExists: false,
  credentialId: null,
  workflowId: null,
};
