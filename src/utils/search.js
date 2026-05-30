import { seoMatrixLabels } from './seoMatrix';

/** Theme pools used when API rows omit tag / keyword arrays. */
const THEME_KEYWORD_POOLS = [
  {
    patterns: /\b(robotaxi|autonomous\s+driv|self[- ]driv|lidar|waymo|cruise|sensor\s+fusion|computer\s+vision|mobility|fsd)\b/i,
    tags: ['robotaxis', 'computer vision', 'lidar', 'sensor fusion', 'edge computing'],
  },
  {
    patterns: /\b(llm|language\s+model|machine\s+learning|neural\s+net|vector\s+database|python|openai|gemini|deepmind|foundation\s+model|generative\s+ai|gpt|transformer)\b/i,
    tags: ['LLMs', 'machine learning', 'neural networks', 'vector databases', 'python'],
  },
  {
    patterns: /\b(cloud\s+comput|saas|venture\s+capital|startup|data\s+center|infrastructure|enterprise|funding|ipo)\b/i,
    tags: ['cloud computing', 'saas', 'venture capital', 'startups'],
  },
];

const DEFAULT_STORY_TAGS = ['LLMs', 'machine learning', 'artificial intelligence', 'technology news'];

function humanizeCategorySlug(value) {
  return String(value).replace(/-/g, ' ').trim();
}

function categoryLabels(article) {
  return [
    article?.content_category_l1,
    article?.content_category_l2,
    article?.source?.content_category_l1,
    article?.source?.content_category_l2,
  ]
    .filter(Boolean)
    .map(humanizeCategorySlug);
}

function buildArticleCorpus(article) {
  return [
    article?.seo_title,
    article?.meta_description,
    article?.slug?.replace(/-/g, ' '),
    article?.source?.title,
    article?.source?.summary,
    ...categoryLabels(article),
    ...(article?.source?.entity_tags || []),
  ]
    .filter(Boolean)
    .join(' ');
}

/** Infer meaningful tags from title, slug, categories, and entity metadata. */
export function inferStoryKeywords(article) {
  const corpus = buildArticleCorpus(article);
  for (const pool of THEME_KEYWORD_POOLS) {
    if (pool.patterns.test(corpus)) return [...pool.tags];
  }
  return [...DEFAULT_STORY_TAGS];
}

function collectExplicitKeywordLabels(article) {
  const raw = [
    ...(Array.isArray(article?.tags) ? article.tags : []),
    ...(Array.isArray(article?.keywords) ? article.keywords : []),
    ...(article?.target_keywords || []),
    ...(article?.trending_keywords_used || []),
    ...(article?.source?.entity_tags || []),
    ...categoryLabels(article),
    ...seoMatrixLabels(article),
  ];
  return [...new Set(raw.map((tag) => String(tag).trim()).filter(Boolean))];
}

/**
 * Ensure every article has populated `tags` and `keywords` arrays.
 * Infers theme-based keywords when the API omits them on list payloads.
 */
export function enrichArticleKeywords(article) {
  if (!article) return article;
  if (article.__keywordsEnriched) return article;

  const explicit = collectExplicitKeywordLabels(article);
  const tags = explicit.length ? explicit : inferStoryKeywords(article);

  return {
    ...article,
    tags: Array.isArray(article.tags) && article.tags.filter(Boolean).length ? article.tags : tags,
    keywords:
      Array.isArray(article.keywords) && article.keywords.filter(Boolean).length
        ? article.keywords
        : tags,
    __keywordsEnriched: true,
  };
}

export function enrichArticlesForSearch(articles) {
  return (articles || []).map(enrichArticleKeywords);
}

/** Decode and normalize a search string from the URL or form input. */
export function normalizeSearchQuery(raw) {
  if (raw == null || raw === '') return '';
  const text = String(raw).replace(/\+/g, ' ');
  try {
    return decodeURIComponent(text).toLowerCase().trim();
  } catch {
    return text.toLowerCase().trim();
  }
}

/** Human-readable search label for UI (preserves original casing). */
export function parseSearchDisplay(raw) {
  if (raw == null || raw === '') return '';
  const text = String(raw).replace(/\+/g, ' ');
  try {
    return decodeURIComponent(text).trim();
  } catch {
    return text.trim();
  }
}

/** Display labels from an article's tag / keyword fields. */
export function getArticleKeywordLabels(article) {
  const enriched = enrichArticleKeywords(article);
  return collectExplicitKeywordLabels(enriched);
}

/** Tags/keywords attached to an article for client-side search (lowercase). */
export function getArticleTags(article) {
  return getArticleKeywordLabels(article).map((tag) => tag.toLowerCase());
}

/**
 * Case-insensitive phrase match against seo_title, meta_description, slug, or keywords.
 */
export function articleMatchesSearch(article, normalizedQuery) {
  if (!normalizedQuery) return true;

  const title = (article?.seo_title || '').toLowerCase();
  const description = (article?.meta_description || '').toLowerCase();
  const slug = (article?.slug || '').toLowerCase();
  const slugPhrase = normalizedQuery.replace(/\s+/g, '-');

  if (
    title.includes(normalizedQuery) ||
    description.includes(normalizedQuery) ||
    slug.includes(normalizedQuery) ||
    slug.includes(slugPhrase)
  ) {
    return true;
  }

  return getArticleTags(article).some((tag) => tag.includes(normalizedQuery));
}

export function filterArticlesBySearch(articles, normalizedQuery) {
  if (!normalizedQuery) return articles || [];
  return (articles || []).filter((article) => articleMatchesSearch(article, normalizedQuery));
}

export function paginateArticles(articles, page, pageSize) {
  const start = (page - 1) * pageSize;
  return articles.slice(start, start + pageSize);
}
