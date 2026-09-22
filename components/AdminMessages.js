'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/lib/utils';

const KIND_LABELS = {
  submission: 'Article submission',
  question: 'Question',
  support: 'Support',
};

function MessageRow({ message, onChanged }) {
  const [busy, setBusy] = useState(false);

  async function patch(payload) {
    setBusy(true);
    try {
      await fetch('/api/messages/' + message.id, {
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
    if (!window.confirm('Delete this message?')) return;
    setBusy(true);
    try {
      await fetch('/api/messages/' + message.id, { method: 'DELETE' });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="panel" style={{ gap: 12, opacity: message.read ? 0.72 : 1 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="pill pill-draft">{KIND_LABELS[message.kind] || 'Message'}</span>
        <strong style={{ fontFamily: 'var(--font-display)' }}>{message.name}</strong>
        <a href={'mailto:' + message.email} style={{ fontSize: '0.85rem' }}>
          {message.email}
        </a>
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginLeft: 'auto' }}>
          {timeAgo(message.created_at)}
        </span>
      </div>
      {message.subject ? (
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>
          {message.subject}
        </strong>
      ) : null}
      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.body}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="button button-quiet button-small"
          disabled={busy}
          onClick={() => patch({ read: !message.read })}
        >
          {message.read ? 'Mark unread' : 'Mark read'}
        </button>
        <button type="button" className="button button-danger button-small" disabled={busy} onClick={remove}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default function AdminMessages({ messages }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const visible = messages.filter((m) => {
    if (filter === 'unread') return !m.read;
    if (filter === 'submission' || filter === 'question' || filter === 'support') return m.kind === filter;
    return true;
  });

  if (messages.length === 0) {
    return (
      <div className="empty">
        <h3>No messages yet</h3>
        <p>Article submissions, questions and support requests will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['all', 'All'],
          ['unread', 'Unread'],
          ['submission', 'Submissions'],
          ['question', 'Questions'],
          ['support', 'Support'],
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
        {visible.map((message) => (
          <MessageRow key={message.id} message={message} onChanged={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}
