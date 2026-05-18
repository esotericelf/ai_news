import { useState } from 'react';
import { resolveArticleImageUrl } from '../../utils/image';

const PLACEHOLDER = '/placeholder-article.svg';

export default function ArticleImage({ article, className, ...props }) {
  const resolved = resolveArticleImageUrl(article);
  const [src, setSrc] = useState(resolved || PLACEHOLDER);

  return (
    <img
      {...props}
      className={className}
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => {
        if (src !== PLACEHOLDER) setSrc(PLACEHOLDER);
      }}
    />
  );
}
