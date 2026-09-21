'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm({ next = '/admin' }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign-in failed.');
      } else {
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError('No connection to the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <Link href="/" className="wordmark" style={{ fontSize: '2rem' }}>
          SHAM<span className="wordmark-dot" aria-hidden="true" />
        </Link>
        <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
          Sign in to write, edit and moderate.
        </p>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>
        {error ? <div className="notice notice-error">{error}</div> : null}
        <button type="submit" className="button" disabled={busy}>
          {busy ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
