'use client';

import { useEffect, useState } from 'react';
import {
  IconFacebook,
  IconLink,
  IconLinkedin,
  IconMail,
  IconReddit,
  IconShare,
  IconTelegram,
  IconWhatsapp,
  IconX,
} from '@/components/Icons';

export default function ShareBar({ url, title }) {
  const [toast, setToast] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { name: 'X', href: 'https://twitter.com/intent/tweet?text=' + encodedTitle + '&url=' + encodedUrl, Icon: IconX },
    { name: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl, Icon: IconFacebook },
    { name: 'WhatsApp', href: 'https://api.whatsapp.com/send?text=' + encodedTitle + '%20' + encodedUrl, Icon: IconWhatsapp },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl, Icon: IconLinkedin },
    { name: 'Telegram', href: 'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedTitle, Icon: IconTelegram },
    { name: 'Reddit', href: 'https://www.reddit.com/submit?url=' + encodedUrl + '&title=' + encodedTitle, Icon: IconReddit },
    { name: 'Email', href: 'mailto:?subject=' + encodedTitle + '&body=' + encodedUrl, Icon: IconMail },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied');
    } catch (err) {
      setToast('Copy the link from your address bar');
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      /* the reader dismissed the sheet */
    }
  }

  return (
    <div className={layout === 'rail' ? 'share-rail' : 'share-list'}>
      {targets.map(({ name, href, Icon }) => (
        <a
          key={name}
          className="share-button"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={'Share on ' + name}
          aria-label={'Share on ' + name}
        >
          <Icon aria-hidden="true" />
        </a>
      ))}
      <button type="button" className="share-button" onClick={copyLink} title="Copy link" aria-label="Copy link">
        <IconLink aria-hidden="true" />
      </button>
      {canNativeShare ? (
        <button type="button" className="share-button" onClick={nativeShare} title="Share" aria-label="Share">
          <IconShare aria-hidden="true" />
        </button>
      ) : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}
