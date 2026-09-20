'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/lib/utils';

function CommentRow({ comment, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(comment.name);
  const [body, setBody] = useState(comment.body);
  const [busy, setBusy] = useState(false);

  async function patch(payload) {
    setBusy(true);
    try {
      await fetch('/api/comments/' + comment.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this comment?')) return;
    setBusy(true);
    try {
      await fetch('/api/comments/' + comment.id, { method: 'DELETE' });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className="panel"
      style={{ gap: 12, opacity: comment.approved ? 1 : 0.62 }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ fontFamily: 'var(--font-display)' }}>{comment.name}</strong>
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>{timeAgo(comment.created_at)}</span>
        {comment.pinned ? <span className="comment-pin">Pinned</span> : null}
        {!comment.approved ? <span className="pill pill-draft">Hidden</span> : null}
        <Link
          href={'/article/' + comment.article_slug + '#comments'}
          target="_blank"
          style={{ marginLeft: 'auto', fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}
        >
          {comment.article_title}
        </Link>
      </div>

      {editing ? (
        <>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Commenter name" />
          <textarea className="input textarea" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Comment text" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="button button-small"
              disabled={busy}
              onClick={async () => {
                await patch({ name, body });
                setEditing(false);
              }}
            >
              Save changes
            </button>
            <button type="button" className="button button-quiet button-small" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{comment.body}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="button button-quiet button-small" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              type="button"
              className="button button-quiet button-small"
              disabled={busy}
              onClick={() => patch({ approved: !comment.approved })}
            >
              {comment.approved ? 'Hide' : 'Show'}
            </button>
            <button
              type="button"
              className="button button-quiet button-small"
              disabled={busy}
              onClick={() => patch({ pinned: !comment.pinned })}
            >
              {comment.pinned ? 'Unpin' : 'Pin to top'}
            </button>
            <button type="button" className="button button-danger button-small" disabled={busy} onClick={remove}>
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default function AdminComments({ comments }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const visible = comments.filter((c) => {
    if (filter === 'hidden') return !c.approved;
    if (filter === 'pinned') return c.pinned;
    return true;
  });

  if (comments.length === 0) {
    return (
      <div className="empty">
        <h3>No comments yet</h3>
        <p>When readers start replying, they show up here.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          ['all', 'All'],
          ['pinned', 'Pinned'],
          ['hidden', 'Hidden'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={'button button-small ' + (filter === value ? '' : 'button-quiet')}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {visible.map((comment) => (
          <CommentRow key={comment.id} comment={comment} onChanged={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}
