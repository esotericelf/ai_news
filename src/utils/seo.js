import { absoluteArticleUrl, config } from '../config';
import { resolveArticleImageUrl } from './image';
import {
  normalizeEntities,
  normalizeKeyMetrics,
  normalizeThreeSentenceSummary,
  seoMatrixLabels,
} from './seoMatrix';

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
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
