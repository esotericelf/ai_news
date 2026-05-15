import DOMPurify from 'dompurify';

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'a',
    'strong',
    'em',
    'blockquote',
    'br',
  ],
  ALLOWED_ATTR: ['href', 'title', 'rel', 'target'],
};

export default function ArticleBody({ html }) {
  if (!html) return null;

  const clean = DOMPurify.sanitize(html, PURIFY_CONFIG);

  return (
    <div
      className="article-body prose"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
