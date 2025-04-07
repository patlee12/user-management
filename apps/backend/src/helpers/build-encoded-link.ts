/**
 * Builds a URL with encoded query string parameters.
 *
 * @param baseUrl - The base URL (e.g., https://yourapp.com/path)
 * @param params - An object of query parameters
 * @returns A fully encoded URL string with query params
 */
export default function buildEncodedLink(
  baseUrl: string,
  params: Record<string, string | number>,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    query.append(key, value.toString());
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${query.toString()}`;
}
