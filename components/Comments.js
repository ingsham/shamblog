'use client';

import { useEffect, useState } from 'react';
import { timeAgo } from '@/lib/utils';

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Comments({ articleId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sham-commenter');
      if (saved) setName(saved);
    } catch (err) {
      /* storage may be blocked */
    }
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    const trimmedName = name.trim() || 'Reader';
    const trimmedBody = body.trim();
    if (trimmedBody.length < 2) {
      setStatus({ type: 'error', text: 'Write a little more before posting.' });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, name: trimmedName, body: trimmedBody, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'That comment did not post. Try again.' });
      } else {
        setComments((list) => [data.comment, ...list]);
        setBody('');
        setStatus({ type: 'ok', text: 'Posted. Thanks for joining in.' });
        try {
          localStorage.setItem('sham-commenter', trimmedName);
        } catch (err) {
          /* storage may be blocked */
        }
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'No connection. Check your network and post again.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="comments" id="comments">
      <div className="section-head">
        <h2>
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </h2>
      </div>

      <div style={{ marginBottom: 10 }}>
        {comments.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)', padding: '26px 0' }}>
            Nobody has commented yet. Be the first.
          </p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="comment">
              <div className="comment-avatar" aria-hidden="true">{initials(comment.name)}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="comment-name">{comment.name}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
                    {timeAgo(comment.created_at)}
                  </span>
                  {comment.pinned ? <span className="comment-pin">Pinned</span> : null}
                </div>
                <p className="comment-body">{comment.body}</p>
              </div>
            </article>
          ))
        )}
      </div>

      <form className="comment-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="comment-name">Your name</label>
          <input
            id="comment-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="How should we credit you?"
            maxLength={60}
          />
        </div>
        <div className="field">
          <label htmlFor="comment-body">Your comment</label>
          <textarea
            id="comment-body"
            className="input textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="No account needed — just say your piece."
            maxLength={2000}
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
            {sending ? 'Posting' : 'Post comment'}
          </button>
        </div>
      </form>
    </section>
  );
}
