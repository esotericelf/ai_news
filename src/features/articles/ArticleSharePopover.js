import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { config } from '../../config';
import {
  SHARE_PLATFORMS_COMPACT,
  canUseNativeShare,
  copyToClipboard,
} from '../../utils/share';
import { SHARE_ICONS } from './shareIcons';

export default function ArticleSharePopover({ url, title, className = '' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const nativeShare = canUseNativeShare();
  const shareTitle = title || config.siteName;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: `${shareTitle} — ${config.siteName}`,
        url,
      });
      close();
    } catch (err) {
      if (err?.name !== 'AbortError') close();
    }
  }, [url, shareTitle, close]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  if (!url) return null;

  return (
    <div
      ref={rootRef}
      className={`share-popover${className ? ` ${className}` : ''}`}
    >
      <button
        type="button"
        className="share-popover__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        Share
      </button>
      {open && (
        <div
          id={menuId}
          className="share-popover__panel"
          role="dialog"
          aria-label="Share this article"
        >
          <ul className="share-popover__icons">
            {nativeShare && (
              <li>
                <button
                  type="button"
                  className="share-popover__icon-btn"
                  onClick={handleNativeShare}
                  aria-label="Share"
                >
                  {SHARE_ICONS.share}
                </button>
              </li>
            )}
            {SHARE_PLATFORMS_COMPACT.map((platform) => (
              <li key={platform.id}>
                <a
                  href={platform.buildUrl({ url, title: shareTitle })}
                  className="share-popover__icon-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${platform.label}`}
                  onClick={close}
                >
                  {SHARE_ICONS[platform.id]}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="share-popover__icon-btn"
                onClick={handleCopy}
                aria-label={copied ? 'Link copied' : 'Copy link'}
              >
                {SHARE_ICONS.link}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
