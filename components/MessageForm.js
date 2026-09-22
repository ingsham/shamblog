'use client';

import { useState } from 'react';

const KINDS = [
  { value: 'submission', label: 'Submit an article for publication' },
  { value: 'question', label: 'Ask a question' },
  { value: 'support', label: 'Get support' },
];

export default function MessageForm() {
  const [kind, setKind] = useState('question');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, name, email, subject, body, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'That message did not send. Try again.' });
      } else {
        setStatus({ type: 'ok', text: 'Sent. The desk will be in touch if a reply is needed.' });
        setSubject('');
        setBody('');
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'No connection. Check your network and send again.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={submit} style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="field">
        <label htmlFor="message-kind">What is this about?</label>
        <select
          id="message-kind"
          className="input select"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {KINDS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>
      <div className="two-up">
        <div className="field">
          <label htmlFor="message-name">Your name</label>
          <input
            id="message-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            maxLength={80}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="message-email">Your email</label>
          <input
            id="message-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={200}
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="message-subject">Subject</label>
        <input
          id="message-subject"
          className="input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="A short line about why you are writing"
          maxLength={200}
        />
      </div>
      <div className="field">
        <label htmlFor="message-body">Message</label>
        <textarea
          id="message-body"
          className="input textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us what you need — the more detail, the faster we can help."
          maxLength={4000}
          required
        />
      </div>
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
      />
      {status ? (
        <div className={'notice ' + (status.type === 'error' ? 'notice-error' : 'notice-ok')}>
          {status.text}
        </div>
      ) : null}
      <div>
        <button type="submit" className="button" disabled={sending}>
          {sending ? 'Sending' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
