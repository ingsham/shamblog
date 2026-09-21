/** Stub of `next/navigation` for the server-side helpers under test. */
export function redirect(url) {
  const error = new Error('NEXT_REDIRECT:' + url);
  error.digest = 'NEXT_REDIRECT;' + url;
  throw error;
}

export function notFound() {
  const error = new Error('NEXT_NOT_FOUND');
  error.digest = 'NEXT_HTTP_ERROR_FALLBACK;404';
  throw error;
}
