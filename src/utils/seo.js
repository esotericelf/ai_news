import { absoluteArticleUrl, config } from '../config';
import { resolveArticleImageUrl } from './image';

export function buildArticleJsonLd(article) {
  const url = absoluteArticleUrl(article.slug);
  const image = resolveArticleImageUrl(article) || undefined;
  const datePublished =
    article.source?.published_at || article.generated_at || undefined;
  const dateModified = article.updated_at || article.generated_at || undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.seo_title || article.source?.title,
    description: article.meta_description,
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
    keywords: (article.target_keywords || []).join(', '),
    isAccessibleForFree: true,
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
