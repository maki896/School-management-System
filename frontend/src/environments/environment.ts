type RuntimeEnvironment = {
  __schoolManagementEnv?: {
    apiBaseUrl?: string;
  };
};

const runtimeEnv =
  (globalThis as typeof globalThis & RuntimeEnvironment).__schoolManagementEnv ?? {};

// Falls back to localhost if no runtime env is injected (development mode)
const apiBaseUrl =
  runtimeEnv.apiBaseUrl && runtimeEnv.apiBaseUrl !== '__VITE_API_BASE_URL__'
    ? runtimeEnv.apiBaseUrl.trim()
    : 'http://localhost:3000/api';

export const environment = {
  production: true,
  apiBaseUrl,
};
