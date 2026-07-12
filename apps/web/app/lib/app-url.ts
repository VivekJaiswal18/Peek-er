export function appUrl(path: string, requestUrl: string) {
  const configuredAppUrl = process.env.APP_URL;
  const baseUrl = configuredAppUrl?.trim() || requestUrl;

  return new URL(path, baseUrl);
}
