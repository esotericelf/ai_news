import { getArticleKeywordLabels, normalizeSearchQuery } from './search';

const FALLBACK_TOPICS = [
  'robotaxis',
  'computer vision',
  'LLMs',
  'machine learning models',
  'generative AI',
  'OpenAI',
  'NVIDIA',
  'autonomous agents',
  'AI safety',
  'large language models',
];

/**
 * Build related search topic chips from article keyword fields.
 * Prefers labels from matched articles; falls back to the full pool + defaults.
 */
export function buildSearchSuggestions(articles, query, { limit = 10, matchedOnly = false } = {}) {
  const normalized = normalizeSearchQuery(query);
  const pool = matchedOnly && Array.isArray(articles) ? articles : articles || [];
  const freq = new Map();

  for (const article of pool) {
    for (const label of getArticleKeywordLabels(article)) {
      const key = label.toLowerCase();
      if (!key) continue;
      if (normalized && (key === normalized || label.toLowerCase().includes(normalized))) {
        continue;
      }
      freq.set(label, (freq.get(label) || 0) + 1);
    }
  }

  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label]) => label);

  const out = [];
  const seen = new Set();

  const add = (label) => {
    const key = label.toLowerCase();
    if (!label || seen.has(key)) return;
    if (normalized && key === normalized) return;
    seen.add(key);
    out.push(label);
  };

  for (const label of ranked) add(label);
  for (const label of FALLBACK_TOPICS) {
    if (out.length >= limit) break;
    add(label);
  }

  return out.slice(0, limit);
}
