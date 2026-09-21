'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import uploadImage from '@/lib/uploadImage';
import { renderMarkdown } from '@/lib/markdown';
import { CATEGORIES, slugify, readingTime, toExcerpt } from '@/lib/utils';

const BLANK = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  cover_credit: '',
  category: CATEGORIES[0],
  tags: '',
  author: 'SHAM',
  status: 'published',
  featured: false,
  likes: '',
  views: '',
};

export default function ArticleEditor({ article = null }) {
  const router = useRouter();
  const isEdit = Boolean(article);
  const bodyRef = useRef(null);
  const coverInputRef = useRef(null);
  const inlineInputRef = useRef(null);

  const [form, setForm] = useState(() =>
    article
      ? {
          ...BLANK,
          ...article,
          likes: String(article.likes ?? ''),
          views: String(article.views ?? ''),
          tags: article.tags || '',
        }
      : BLANK
  );
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');
  const [dragging, setDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const preview = useMemo(() => renderMarkdown(form.content), [form.content]);
  const slugPreview = slugify(form.slug || form.title);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function wrapSelection(before, after = before, placeholder = 'text') {
    const field = bodyRef.current;
    if (!field) return;
    const { selectionStart: start, selectionEnd: end, value } = field;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    update('content', next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertAtCursor(text) {
    const field = bodyRef.current;
    if (!field) {
      update('content', form.content + '\n' + text);
      return;
    }
    const { selectionStart: start, value } = field;
    update('content', value.slice(0, start) + text + value.slice(start));
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + text.length, start + text.length);
    });
  }

  async function handleCoverFile(file) {
    if (!file) return;
    setUploading('cover');
    setStatus(null);
    try {
      const url = await uploadImage(file);
      update('cover_image', url);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setUploading('');
    }
  }

  async function handleInlineFile(file) {
    if (!file) return;
    setUploading('inline');
    setStatus(null);
    try {
      const url = await uploadImage(file);
      insertAtCursor('\n\n![Describe this picture](' + url + ')\n\n');
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setUploading('');
    }
  }

  async function save(overrideStatus) {
    if (busy) return;
    setBusy(true);
    setStatus(null);

    const payload = {
      ...form,
      status: overrideStatus || form.status,
      slug: slugPreview,
      excerpt: form.excerpt.trim() || toExcerpt(form.content),
    };
    if (!isEdit) {
      delete payload.likes;
      delete payload.views;
    }

    try {
      const res = await fetch(isEdit ? '/api/articles/' + article.id : '/api/articles', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', text: data.error || 'Saving failed.' });
      } else if (isEdit) {
        setStatus({ type: 'ok', text: 'Saved.' });
        update('status', data.article.status);
        router.refresh();
      } else {
        router.push('/admin/edit/' + data.article.id);
        router.refresh();
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'No connection to the server.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!isEdit) return;
    if (!window.confirm('Delete this story for good? Its comments and likes go too.')) return;
    setBusy(true);
    try {
      await fetch('/api/articles/' + article.id, { method: 'DELETE' });
      router.push('/admin');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          margin: '30px 0 22px',
        }}
      >
        <h1 className="admin-title" style={{ margin: 0 }}>
          {isEdit ? 'Edit story' : 'Write a story'}
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="button button-quiet" onClick={() => save('draft')} disabled={busy}>
            Save as draft
          </button>
          <button type="button" className="button" onClick={() => save('published')} disabled={busy}>
            {busy ? 'Saving' : 'Publish'}
          </button>
          {isEdit ? (
            <button type="button" className="button button-danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          ) : null}
        </div>
      </div>

      {status ? (
        <div
          className={'notice ' + (status.type === 'error' ? 'notice-error' : 'notice-ok')}
          style={{ marginBottom: 18 }}
        >
          {status.text}
        </div>
      ) : null}

      <div className="editor-layout">
        <div className="panel">
          <div className="field">
            <label htmlFor="title">Headline</label>
            <input
              id="title"
              className="input"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="What happened, in one line"
            />
          </div>

          <div className="field">
            <label htmlFor="excerpt">Standfirst</label>
            <textarea
              id="excerpt"
              className="input textarea"
              style={{ minHeight: 70 }}
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              placeholder="One or two sentences shown under the headline and in previews. Left blank, it is taken from the opening of the story."
            />
          </div>

          <div className="field">
            <label htmlFor="body">Story</label>
            <div className="toolbar">
              <button type="button" onClick={() => wrapSelection('**', '**', 'bold')}>Bold</button>
              <button type="button" onClick={() => wrapSelection('*', '*', 'italic')}>Italic</button>
              <button type="button" onClick={() => insertAtCursor('\n\n## Subheading\n\n')}>Subheading</button>
              <button type="button" onClick={() => wrapSelection('[', '](https://)', 'link text')}>Link</button>
              <button type="button" onClick={() => insertAtCursor('\n\n> A line worth pulling out\n\n')}>Quote</button>
              <button type="button" onClick={() => insertAtCursor('\n\n- First point\n- Second point\n\n')}>List</button>
              <button type="button" onClick={() => insertAtCursor('\n\n---\n\n')}>Divider</button>
              <button type="button" onClick={() => inlineInputRef.current?.click()} disabled={uploading === 'inline'}>
                {uploading === 'inline' ? 'Uploading' : 'Insert picture'}
              </button>
              <button type="button" onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? 'Hide preview' : 'Show preview'}
              </button>
            </div>
            <input
              ref={inlineInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                handleInlineFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <textarea
              id="body"
              ref={bodyRef}
              className="input textarea editor-textarea"
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Write here. Markdown works: **bold**, *italic*, ## subheadings, > quotes, - lists, [links](https://example.com)."
            />
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-display)' }}>
              {form.content.trim() ? form.content.trim().split(/\s+/).length : 0} words ·{' '}
              {readingTime(form.content)} min read · /article/{slugPreview}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <div className="panel">
            <h3>Lead picture</h3>
            <div
              className="dropzone"
              data-dragging={dragging}
              role="button"
              tabIndex={0}
              onClick={() => coverInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') coverInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleCoverFile(e.dataTransfer.files?.[0]);
              }}
            >
              {form.cover_image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.cover_image} alt="Lead picture preview" />
              ) : null}
              {uploading === 'cover'
                ? 'Uploading'
                : form.cover_image
                  ? 'Click or drop another file to replace it'
                  : 'Click to choose a picture from your computer, or drop one here'}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                handleCoverFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {form.cover_image ? (
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => update('cover_image', '')}
              >
                Remove picture
              </button>
            ) : null}
            <div className="field">
              <label htmlFor="cover_credit">Picture credit</label>
              <input
                id="cover_credit"
                className="input"
                value={form.cover_credit}
                onChange={(e) => update('cover_credit', e.target.value)}
                placeholder="Photograph: who took it"
              />
            </div>
          </div>

          <div className="panel">
            <h3>Filing</h3>
            <div className="two-up">
              <div className="field">
                <label htmlFor="category">Section</label>
                <select
                  id="category"
                  className="input select"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  {CATEGORIES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="author">Byline</label>
                <input
                  id="author"
                  className="input"
                  value={form.author}
                  onChange={(e) => update('author', e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                className="input"
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
                placeholder="Separate with commas"
              />
            </div>
            <div className="field">
              <label htmlFor="slug">Web address</label>
              <input
                id="slug"
                className="input"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                placeholder={slugPreview}
              />
            </div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={(e) => update('featured', e.target.checked)}
              />
              Run this at the top of the front page
            </label>
          </div>

          {isEdit ? (
            <div className="panel">
              <h3>Numbers</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                Set these by hand when you need to. Reader likes keep counting on top of whatever
                you put here.
              </p>
              <div className="two-up">
                <div className="field">
                  <label htmlFor="likes">Likes</label>
                  <input
                    id="likes"
                    className="input"
                    type="number"
                    min="0"
                    value={form.likes}
                    onChange={(e) => update('likes', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="views">Views</label>
                  <input
                    id="views"
                    className="input"
                    type="number"
                    min="0"
                    value={form.views}
                    onChange={(e) => update('views', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {showPreview ? (
            <div className="panel">
              <h3>How it will read</h3>
              <div
                className="prose"
                style={{ fontSize: '1rem', maxWidth: 'none' }}
                dangerouslySetInnerHTML={{ __html: preview || '<p>Nothing written yet.</p>' }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
