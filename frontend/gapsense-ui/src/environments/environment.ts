/**
 * Production builds: set this to your deployed API URL.
 * For local `ng build` + static hosting without a proxy, use http://localhost:5120/api (not https://7231
 * unless you have run `dotnet dev-certs https --trust`).
 */
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:5120/api',
};
