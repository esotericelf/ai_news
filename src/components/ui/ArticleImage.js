import { useState } from 'react';
import { resolveArticleImageUrl } from '../../utils/image';

const PLACEHOLDER = '/placeholder-article.svg';

export default function ArticleImage({ article, className, alt, ...props }) {
  const resolved = resolveArticleImageUrl(article);
  const [src, setSrc] = useState(resolved || PLACEHOLDER);
  const computedAlt =
    alt !== undefined ? alt : article?.title ? `Featured image for: ${article.title}` : '';

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
