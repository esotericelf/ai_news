import { getArticleKeywordLabels, normalizeSearchQuery } from './search';

const GLOBAL_TRENDING_SUGGESTIONS = [
  'robotaxis',
  'computer vision',
  'LLMs',
  'machine learning models',
  'cloud computing',
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

  const aggregatedTags = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label]) => label);

  const finalSuggestions =
    aggregatedTags.length > 0 ? aggregatedTags : GLOBAL_TRENDING_SUGGESTIONS;

  const out = [];
  const seen = new Set();

  const add = (label) => {
    const text = String(label).trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) return;
    if (normalized && key === normalized) return;
    seen.add(key);
    out.push(text);
  };

  for (const label of finalSuggestions) {
    if (out.length >= limit) break;
    add(label);
  }

  if (!out.length) {
    for (const label of GLOBAL_TRENDING_SUGGESTIONS) {
      if (out.length >= limit) break;
      add(label);
    }
  }

  return out.slice(0, limit);
}
