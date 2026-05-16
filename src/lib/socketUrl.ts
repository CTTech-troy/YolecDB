export function getSocketOrigin(): string {
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(
    /\/$/,
    ''
  );
  if (base.endsWith('/api')) {
    return base.slice(0, -4);
  }
  return base;
}
