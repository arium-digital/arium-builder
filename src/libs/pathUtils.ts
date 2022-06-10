export const getQuery = () => new URLSearchParams(window.location.search);
// A custom hook that builds on useLocation to parse
// the query string for you.
export function useQuery() {
  return getQuery();
}

export function useQueryParam(
  paramName: string,
  params: URLSearchParams
): string | undefined {
  return params.get(paramName) || undefined;
}

export function useNumberQueryParam(
  paramName: string,
  params: URLSearchParams
): number | undefined {
  const value = params.get(paramName);

  if (!value) return undefined;

  return +value;
}

export function useBooleanQueryParam(
  paramName: string,
  params: URLSearchParams
): boolean {
  const value = params.get(paramName);

  if (value) return Boolean(value);
  return false;
}
