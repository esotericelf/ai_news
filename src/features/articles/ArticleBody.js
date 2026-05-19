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
    'pre',
    'code',
  ],
  ALLOWED_ATTR: ['href', 'rel', 'target', 'class'],
};

const BOILERPLATE_RE =
  /this article covers developments in artificial intelligence|this sponsored article is brought to you by/i;

function stripBoilerplateNodes(node) {
  if (!node?.childNodes) return;
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      stripBoilerplateNodes(child);
      const text = child.textContent || '';
      if (
        (child.tagName === 'P' || child.tagName === 'EM') &&
        BOILERPLATE_RE.test(text)
      ) {
        child.remove();
      }
    }
  });
}

export default function ArticleBody({ html }) {
  if (!html) return null;

  const clean = DOMPurify.sanitize(html, {
    ...PURIFY_CONFIG,
    RETURN_DOM: true,
  });
  stripBoilerplateNodes(clean);
  const safeHtml = clean.innerHTML;

  return (
    <div
      className="article-body prose"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
