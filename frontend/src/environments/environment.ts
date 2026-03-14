type RuntimeEnvironment = {
  __schoolManagementEnv?: {
    apiBaseUrl?: string;
  };
};

const runtimeEnvironment =
  (globalThis as typeof globalThis & RuntimeEnvironment)
    .__schoolManagementEnv ?? {};

export const environment = {
  production: false,
  apiBaseUrl:
    runtimeEnvironment.apiBaseUrl?.trim() || 'http://localhost:3000/api',
};
