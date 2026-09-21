'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'That address did not go through.' });
      } else {
        setStatus({ type: 'ok', text: 'You are on the list. Look out for the next dispatch.' });
        setEmail('');
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'No connection. Try again in a moment.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="subscribe">
      <div>
        <h2>One email, every Friday</h2>
        <p>
          The week&apos;s five stories worth your time, picked by the desk and sent before the
          weekend. No noise, and you can leave whenever you like.
        </p>
      </div>
      <form className="subscribe-form" onSubmit={submit}>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          required
        />
        <button type="submit" className="button" disabled={sending}>
          {sending ? 'Signing up' : 'Sign up'}
        </button>
      </form>
      {status ? (
        <div
          className={'notice ' + (status.type === 'error' ? 'notice-error' : 'notice-ok')}
          style={{ gridColumn: '1 / -1' }}
        >
          {status.text}
        </div>
      ) : null}
    </section>
  );
}
