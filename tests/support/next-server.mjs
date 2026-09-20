/**
 * Stub of `next/server`. Response cookies are written into the same jar that
 * `next/headers` reads from, so a login in one request is visible to the next
 * one exactly as it would be in the browser.
 */
import { jar } from './next-headers.mjs';

export class NextResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Headers(init.headers || {});
    this.cookies = {
      set: (name, value, options = {}) => {
        if (options.maxAge === 0 || value === '') jar.delete(name);
        else jar.set(name, value);
      },
    };
  }

  get ok() {
    return this.status < 400;
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }

  static json(data, init = {}) {
    return new NextResponse(data, init);
  }
}

export default { NextResponse };
