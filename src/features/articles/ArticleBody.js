import DOMPurify from 'dompurify';

/** Matches backend GEO allowlist (content_engine/services/seo_prompts.py). */
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
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'code',
  ],
  ALLOWED_ATTR: ['href', 'rel', 'target', 'class'],
};

const BOILERPLATE_RE =
  /this article covers developments in artificial intelligence|this sponsored article is brought to you by/i;

/** Affiliate CTAs belong in ArticlePartnerCta — not inside LLM body copy. */
const PARTNER_HOST_RE = /customgpt\.ai/i;

function unwrapPartnerAnchors(node) {
  if (!node?.querySelectorAll) return;
  node.querySelectorAll('a[href]').forEach((anchor) => {
    if (PARTNER_HOST_RE.test(anchor.getAttribute('href') || '')) {
      const text = document.createTextNode(anchor.textContent || '');
      anchor.replaceWith(text);
    }
  });
}

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
  unwrapPartnerAnchors(clean);
  const safeHtml = clean.innerHTML;

  return (
    <div
      className="article-content prose prose-slate"
      itemProp="articleBody"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
