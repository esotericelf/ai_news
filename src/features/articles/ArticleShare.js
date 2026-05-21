import { useCallback, useState } from 'react';
import { config } from '../../config';
import {
  SHARE_PLATFORMS,
  canUseNativeShare,
  copyToClipboard,
} from '../../utils/share';
import { SHARE_ICONS } from './shareIcons';

export default function ArticleShare({ url, title }) {
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
        /* user dismissed or unsupported */
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

  return (
    <section className="article-share" aria-label="Share this article">
      <h2 className="article-share__heading">Share</h2>
      <div className="article-share__actions">
        {nativeShare && (
          <button
            type="button"
            className="article-share__native"
            onClick={handleNativeShare}
          >
            <span className="article-share__native-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
                />
              </svg>
            </span>
            Share
          </button>
        )}
        <ul className="article-share__list">
          {SHARE_PLATFORMS.map((platform) => (
            <li key={platform.id}>
              <a
                href={platform.buildUrl({ url, title: shareTitle })}
                className={`article-share__btn article-share__btn--${platform.id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${platform.label}`}
              >
                <span className="article-share__icon">{SHARE_ICONS[platform.id]}</span>
                <span className="article-share__name">{platform.label}</span>
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
              <span className="article-share__name">{copied ? 'Copied' : 'Copy link'}</span>
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}
