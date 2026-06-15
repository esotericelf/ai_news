import { absoluteArticleUrl, clusterSearchUrl, config } from '../config';
import { SITEMAP_PAGE_SECTIONS } from '../config/siteDirectory';
import { resolveArticleImageUrl } from './image';
import { getRelationalKeywordLabels } from './search';
import {
  normalizeEntities,
  normalizeKeyMetrics,
  normalizeThreeSentenceSummary,
  seoMatrixLabels,
} from './seoMatrix';

const CLUSTER_BREADCRUMB_ITEMS =
  SITEMAP_PAGE_SECTIONS.find((section) => section.id === 'clusters')?.items ?? [];

/** Position 2 when no exploration cluster matches the article. */
const DEFAULT_ARTICLE_BREADCRUMB_TIER = {
  name: 'Tech News',
  url: clusterSearchUrl('all'),
};

function normalizeBreadcrumbToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Map an article to its primary exploration cluster for structured breadcrumbs. */
export function resolveArticleClusterBreadcrumb(article) {
  const keywordLabels = getRelationalKeywordLabels(article);
  const keywordTokens = new Set(keywordLabels.map(normalizeBreadcrumbToken));
  const corpus = [
    ...keywordLabels,
    article?.seo_title,
    article?.meta_description,
    article?.content_category_l1,
    article?.content_category_l2,
    article?.source?.content_category_l1,
    article?.source?.content_category_l2,
    ...(article?.target_keywords || []),
  ]
    .filter(Boolean)
    .map(normalizeBreadcrumbToken)
    .join(' ');

  for (const cluster of CLUSTER_BREADCRUMB_ITEMS) {
    const searchTerm = String(cluster.search || '').trim();
    const labelTerm = String(cluster.label || '').trim();
    const searchToken = normalizeBreadcrumbToken(searchTerm);
    const labelToken = normalizeBreadcrumbToken(labelTerm);
    const matchesCluster =
      keywordTokens.has(searchToken) ||
      keywordTokens.has(labelToken) ||
      (searchToken && corpus.includes(searchToken)) ||
      (labelToken && corpus.includes(labelToken));

    if (matchesCluster && searchTerm) {
      return {
        name: labelTerm || searchTerm,
        url: clusterSearchUrl(searchTerm),
      };
    }
  }

  return null;
}

function buildArticleMentions(article) {
  const companies = normalizeEntities(article?.companies).map((c) => ({
    '@type': 'Organization',
    name: c.label,
  }));
  const tools = normalizeEntities(article?.tools).map((t) => ({
    '@type': 'SoftwareApplication',
    name: t.label,
  }));
  const mentions = [...companies, ...tools];
  return mentions.length ? mentions : undefined;
}

function buildArticleAbout(article) {
  const industries = normalizeEntities(article?.industries).map((i) => ({
    '@type': 'Thing',
    name: i.label,
  }));
  return industries.length ? industries : undefined;
}

export function buildArticleJsonLd(article) {
  const url = absoluteArticleUrl(article.slug);
  const image = resolveArticleImageUrl(article) || undefined;
  const datePublished =
    article.source?.published_at || article.generated_at || undefined;
  const dateModified = article.updated_at || article.generated_at || undefined;
  const summary = normalizeThreeSentenceSummary(article?.three_sentence_summary);
  const abstractText = summary.length ? summary.join(' ') : undefined;
  const matrixKeywords = seoMatrixLabels(article);
  const keywordList = [...(article.target_keywords || []), ...matrixKeywords];
  const metrics = normalizeKeyMetrics(article?.key_metrics);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.seo_title || article.source?.title,
    description: abstractText || article.meta_description,
    abstract: abstractText,
    image: image ? [image] : undefined,
    datePublished,
    dateModified,
    author: {
      '@type': 'Organization',
      name: config.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: config.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${config.siteUrl}/icon-512.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    keywords: keywordList.length ? [...new Set(keywordList)].join(', ') : undefined,
    mentions: buildArticleMentions(article),
    about: buildArticleAbout(article),
    isAccessibleForFree: true,
    ...(metrics.length > 0 && {
      additionalProperty: metrics.map((m) => ({
        '@type': 'PropertyValue',
        name: m.label,
        value: m.value || m.label,
      })),
    }),
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    description: config.siteDescription,
    url: config.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbJsonLd(items) {
  const crumbs = (items || []).filter((item) => item?.name);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((item, index) => {
      const listItem = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
      };
      if (item.url) {
        listItem.item = item.url;
      }
      return listItem;
    }),
  };
}

/** Article route: Home → cluster search archive → current headline (always 3 tiers). */
export function buildArticleBreadcrumbJsonLd(article) {
  const title = article?.seo_title || article?.source?.title || 'Untitled';
  const canonical = absoluteArticleUrl(article.slug);
  const cluster = resolveArticleClusterBreadcrumb(article);
  const tier2 =
    cluster?.name?.trim() && cluster?.url
      ? cluster
      : DEFAULT_ARTICLE_BREADCRUMB_TIER;

  return buildBreadcrumbJsonLd([
    { name: 'Home', url: config.siteUrl },
    tier2,
    { name: title, url: canonical },
  ]);
}
