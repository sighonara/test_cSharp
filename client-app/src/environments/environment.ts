export const environment = {
  production: false,
  // Use window.location.hostname so it works from any machine (localhost or IP)
  apiBaseUrl: `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5155`
};
