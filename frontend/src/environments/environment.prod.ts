type RuntimeEnvironment = {
  __schoolManagementEnv?: {
    apiBaseUrl?: string;
  };
};

const runtimeEnvironment =
  (globalThis as typeof globalThis & RuntimeEnvironment)
    .__schoolManagementEnv ?? {};

export const environment = {
  production: true,
  apiBaseUrl: runtimeEnvironment.apiBaseUrl?.trim() || '/api',
};
