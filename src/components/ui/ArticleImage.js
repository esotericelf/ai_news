import { useState } from 'react';
import { resolveArticleImageUrl } from '../../utils/image';
import { articleTitle } from '../../utils/article';

const PLACEHOLDER = '/placeholder-article.svg';

export default function ArticleImage({ article, className, alt, ...props }) {
  const resolved = resolveArticleImageUrl(article);
  const [src, setSrc] = useState(resolved || PLACEHOLDER);
  const computedAlt = (() => {
    if (alt !== undefined) return alt;
    const title = articleTitle(article);
    return title && title !== 'Untitled' ? `Featured image for: ${title}` : '';
  })();

  return (
    <img
      {...props}
      className={className}
      src={src}
      alt={computedAlt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (src !== PLACEHOLDER) setSrc(PLACEHOLDER);
      }}
    />
  );
}
