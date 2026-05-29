import { partnerCtaConfig } from '../config/partnerCta';
import { seoMatrixLabels } from './seoMatrix';

const RULES = [
  {
    variant: 'customerService',
    re: /\b(customer\s*service|support\s*bot|help\s*desk|chatbot|contact\s*center)\b/i,
  },
  {
    variant: 'api',
    re: /\b(api|sdk|developer|integration|embed|webhook|rest\s*api)\b/i,
  },
  { variant: 'demo', re: /\b(demo|try\s+it|walkthrough|sandbox)\b/i },
  {
    variant: 'mit',
    re: /\b(mit|entrepreneur|university|campus|student\s*founder)\b/i,
  },
];

function haystack(article) {
  const src = article?.source || {};
  const parts = [
    article?.seo_title,
    article?.meta_description,
    ...(article?.target_keywords || []),
    ...seoMatrixLabels(article),
    ...(article?.trending_keywords_used || []),
    src.content_category_l1,
    src.content_category_l2,
    src.title,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

/** Pick the most relevant partner CTA for an article (deterministic, no LLM). */
export function pickPartnerCtaVariant(article) {
  if (!partnerCtaConfig.enabled || !article) return null;

  const text = haystack(article);
  for (const { variant, re } of RULES) {
    if (re.test(text)) return variant;
  }

  const l2 = (article?.source?.content_category_l2 || '').toLowerCase();
  if (l2.includes('developer') || l2.includes('coding') || l2.includes('api')) {
    return 'api';
  }
  if (l2.includes('creative') || l2.includes('design')) {
    return 'demo';
  }

  return 'default';
}

export function getPartnerCtaForArticle(article) {
  const key = pickPartnerCtaVariant(article);
  if (!key) return null;
  return partnerCtaConfig.variants[key] || partnerCtaConfig.variants.default;
}
