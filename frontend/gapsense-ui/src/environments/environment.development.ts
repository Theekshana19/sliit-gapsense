/**
 * Relative `/api` + `proxy.conf.json` → browser calls same origin (localhost:4200/api/...)
 * and the dev server forwards to http://localhost:5120. Avoids CORS and HTTPS cert errors (status 0).
 *
 * Start API first: `dotnet run --launch-profile http` from GapSense.API (must listen on http://localhost:5120).
 * Follow-up queue data is included in `GET /api/dashboard/full` (no extra GET). Actions use POST under `/api/dashboard/follow-up-*`.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
