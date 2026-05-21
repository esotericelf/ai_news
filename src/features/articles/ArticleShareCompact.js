import { useCallback, useState } from 'react';
import { config } from '../../config';
import {
  SHARE_PLATFORMS_COMPACT,
  canUseNativeShare,
  copyToClipboard,
} from '../../utils/share';
import { SHARE_ICONS } from './shareIcons';

export default function ArticleShareCompact({ url, title, className = '' }) {
  const [copied, setCopied] = useState(false);
  const nativeShare = canUseNativeShare();
  const shareTitle = title || config.siteName;

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: `${shareTitle} — ${config.siteName}`,
        url,
      });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        /* dismissed */
      }
    }
  }, [url, shareTitle]);

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
      className={`article-share article-share--compact${className ? ` ${className}` : ''}`}
      aria-label="Share this article"
    >
      <ul className="article-share__list">
        {nativeShare && (
          <li>
            <button
              type="button"
              className="article-share__btn article-share__btn--native"
              onClick={handleNativeShare}
              aria-label="Share"
            >
              <span className="article-share__icon">{SHARE_ICONS.share}</span>
            </button>
          </li>
        )}
        {SHARE_PLATFORMS_COMPACT.map((platform) => (
          <li key={platform.id}>
            <a
              href={platform.buildUrl({ url, title: shareTitle })}
              className={`article-share__btn article-share__btn--${platform.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${platform.label}`}
            >
              <span className="article-share__icon">{SHARE_ICONS[platform.id]}</span>
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="article-share__btn article-share__btn--copy"
            onClick={handleCopy}
            aria-label={copied ? 'Link copied' : 'Copy link'}
          >
            <span className="article-share__icon">{SHARE_ICONS.link}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
