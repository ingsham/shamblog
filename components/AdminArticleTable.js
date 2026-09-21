'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function AdminArticleTable({ articles }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('');

  async function patch(id, payload) {
    setBusyId(id);
    try {
      await fetch('/api/articles/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id, title) {
    if (!window.confirm('Delete “' + title + '”? Its comments and likes go too.')) return;
    setBusyId(id);
    try {
      await fetch('/api/articles/' + id, { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const visible = filter
    ? articles.filter((a) => (a.title + ' ' + a.category).toLowerCase().includes(filter.toLowerCase()))
    : articles;

  return (
    <div>
      <input
        className="input"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by headline or section"
        style={{ maxWidth: 320, marginBottom: 16 }}
        aria-label="Filter stories"
      />

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Headline</th>
              <th>Section</th>
              <th>Published</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>State</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((article) => (
              <tr key={article.id}>
                <td style={{ maxWidth: 320 }}>
                  <Link href={'/admin/edit/' + article.id} style={{ fontWeight: 600 }}>
                    {article.title}
                  </Link>
                  {article.featured ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--signal)' }}>Front page lead</div>
                  ) : null}
                </td>
                <td>{article.category}</td>
                <td>{formatDate(article.published_at)}</td>
                <td>{article.views}</td>
                <td>{article.likes}</td>
                <td>{article.comment_count}</td>
                <td>
                  <span className={'pill ' + (article.status === 'published' ? 'pill-live' : 'pill-draft')}>
                    {article.status === 'published' ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link href={'/article/' + article.slug} className="button button-quiet button-small" target="_blank">
                      View
                    </Link>
                    <button
                      type="button"
                      className="button button-quiet button-small"
                      disabled={busyId === article.id}
                      onClick={() =>
                        patch(article.id, {
                          status: article.status === 'published' ? 'draft' : 'published',
                        })
                      }
                    >
                      {article.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className="button button-quiet button-small"
                      disabled={busyId === article.id}
                      onClick={() => patch(article.id, { featured: !article.featured })}
                    >
                      {article.featured ? 'Unpin' : 'Pin to top'}
                    </button>
                    <button
                      type="button"
                      className="button button-danger button-small"
                      disabled={busyId === article.id}
                      onClick={() => remove(article.id, article.title)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', padding: '26px 0' }}>Nothing matches that filter.</p>
      ) : null}
    </div>
  );
}
