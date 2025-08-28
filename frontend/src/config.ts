import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';


export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
  apiBaseUrl: string;
}

export const config: Config = {
  site: { name: 'RN 4PRO', description: '', themeColor: '#090a0b', url: getSiteURL() },
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ?? LogLevel.ALL,
  apiBaseUrl: 'https://backend-production-d322.up.railway.app',
};
