/** Stub of `next/headers` backed by a jar the tests can inspect and refill. */
export const jar = new Map();

export async function cookies() {
  return {
    get(name) {
      return jar.has(name) ? { name, value: jar.get(name) } : undefined;
    },
    set(name, value) {
      jar.set(name, value);
    },
  };
}

export async function headers() {
  return new Headers();
}
