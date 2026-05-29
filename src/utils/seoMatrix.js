/** Coerce API JSON arrays (or legacy string JSON) into a list. */
function asArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [trimmed];
    } catch {
      return [trimmed];
    }
  }
  return [];
}

function textFromItem(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'object') {
    const nested = item.company || item.tool || item.industry || item.entity;
    if (nested) return textFromItem(nested);
    return (
      item.name ||
      item.title ||
      item.label ||
      item.text ||
      item.sentence ||
      item.summary ||
      ''
    )
      .toString()
      .trim();
  }
  return String(item).trim();
}

function slugFromItem(item) {
  if (item && typeof item === 'object') {
    const nested = item.company || item.tool || item.industry || item.entity;
    if (nested) return slugFromItem(nested);
    const slug = (item.slug || item.tag_slug || '').toString().trim();
    return slug || null;
  }
  return null;
}

/** Deduplicated { label, slug, matrixType } rows from matrix arrays. */
export function normalizeEntities(items, matrixType) {
  const seen = new Set();
  const out = [];
  for (const raw of asArray(items)) {
    const label = textFromItem(raw);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, slug: slugFromItem(raw), matrixType });
  }
  return out;
}

/** { label, value } rows for key_metrics arrays. */
export function normalizeKeyMetrics(items) {
  const out = [];
  for (const raw of asArray(items)) {
    if (typeof raw === 'string') {
      const text = raw.trim();
      if (text) out.push({ label: text, value: '' });
      continue;
    }
    if (!raw || typeof raw !== 'object') continue;
    const nested = raw.key_metric || raw.metric;
    const item = nested && typeof nested === 'object' ? nested : raw;
    const label = (item.label || item.name || item.metric || item.key || '')
      .toString()
      .trim();
    const value = (item.value ?? item.amount ?? item.data ?? '').toString().trim();
    if (!label && !value) continue;
    out.push({
      label: label || value,
      value: label ? value : '',
    });
  }
  return out;
}

/** Up to three summary sentences from three_sentence_summary. */
export function normalizeThreeSentenceSummary(value) {
  const fromArray = asArray(value)
    .map((item) => textFromItem(item))
    .filter(Boolean);
  if (fromArray.length) return fromArray;

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return [];
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 1) {
      return sentences.map((s) => s.trim()).filter(Boolean);
    }
    return [text];
  }
  return [];
}

export function articleExcerpt(article) {
  const summary = normalizeThreeSentenceSummary(article?.three_sentence_summary);
  if (summary.length) return summary.join(' ');
  return article?.meta_description || '';
}

/** Companies and tools only — used for inline card / header badges. */
export function companyAndToolBadges(article) {
  if (!article) return [];
  return [
    ...normalizeEntities(article.companies, 'company'),
    ...normalizeEntities(article.tools, 'tool'),
  ];
}

/** Flat labels for search / partner CTA / related-article matching. */
export function seoMatrixLabels(article) {
  if (!article) return [];
  return [
    ...normalizeEntities(article.companies, 'company'),
    ...normalizeEntities(article.tools, 'tool'),
    ...normalizeEntities(article.industries, 'industry'),
  ].map((e) => e.label);
}
