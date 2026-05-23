import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArticleImage from '../components/ui/ArticleImage';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ErrorState from '../components/ui/ErrorState';
import Tag from '../components/ui/Tag';
import ArticleBody from '../features/articles/ArticleBody';
import ArticleMeta from '../features/articles/ArticleMeta';
import ArticlePartnerCta from '../features/articles/ArticlePartnerCta';
import ArticleSharePopover from '../features/articles/ArticleSharePopover';
import RelatedArticles from '../features/articles/RelatedArticles';
import JsonLd from '../seo/JsonLd';
import SeoHead from '../seo/SeoHead';
import { absoluteArticleUrl, config } from '../config';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadArticleBySlug, loadArticles } from '../store/slices/articlesSlice';
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '../utils/seo';
import { articleCategory, articleTitle, resolveArticleImageUrl } from '../utils/article';

export default function ArticlePage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();

  const { bySlug, detailStatus, detailError, list } = useAppSelector(
    (state) => state.articles
  );

  const article = bySlug[slug];
  const is404 = detailError?.status === 404;

  useEffect(() => {
    if (slug) dispatch(loadArticleBySlug(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (list.length === 0) {
      dispatch(loadArticles({ page: 1 }));
    }
  }, [dispatch, list.length]);

  if (detailStatus === 'loading' && !article) {
    return (
      <div className="page page--article">
        <div className="article-skeleton" aria-busy="true" aria-label="Loading article" />
      </div>
    );
  }

  if (detailStatus === 'failed' || !article) {
    return (
      <div className="page page--article">
        <SeoHead title="Not found" noindex />
        <ErrorState
          message={is404 ? 'This article does not exist.' : detailError?.message}
          onRetry={!is404 ? () => dispatch(loadArticleBySlug(slug)) : undefined}
        />
        <p>
          <Link to="/">← Back to latest news</Link>
        </p>
      </div>
    );
  }

  const title = articleTitle(article);
  const category = articleCategory(article);
  const canonical = absoluteArticleUrl(article.slug);
  const keywords = article.target_keywords || [];
  const imageUrl = resolveArticleImageUrl(article);

  const jsonLd = [
    buildArticleJsonLd(article),
    buildBreadcrumbJsonLd([
      { name: 'Home', url: config.siteUrl },
      { name: title, url: canonical },
    ]),
  ];

  return (
    <>
      <SeoHead
        title={title}
        description={article.meta_description}
        canonical={canonical}
        image={imageUrl}
        type="article"
        keywords={keywords}
      />
      <JsonLd data={jsonLd} />

      <article
        className="page page--article article-geo"
        itemScope
        itemType="https://schema.org/NewsArticle"
      >
        <div className="article-geo__shell">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />

          <header className="article-header">
            <span className="article-eyebrow">{category}</span>
            <h1 itemProp="headline">{title}</h1>
            <ArticleMeta article={article} />
            {keywords.length > 0 && (
              <ul className="article-header__tags" aria-label="Topics">
                {keywords.map((kw) => (
                  <li key={kw}>
                    <Tag label={kw} />
                  </li>
                ))}
              </ul>
            )}
            <ArticleSharePopover url={canonical} title={title} className="article-header__share" />
          </header>

          <figure className="article-figure">
            <ArticleImage
              article={article}
              itemProp="image"
              width={1200}
              height={630}
              fetchPriority="high"
            />
          </figure>

          <div className="article-geo__content">
            <ArticleBody html={article.body_html} />
          </div>

          <ArticlePartnerCta article={article} />

          <footer className="article-footer">
            <p className="article-footer__attribution">
              Summary based on reporting from the original publisher.{' '}
              {article.canonical_url && (
                <a href={article.canonical_url} rel="noopener noreferrer" target="_blank">
                  Read original article
                </a>
              )}
            </p>
          </footer>

          <RelatedArticles
            articles={list}
            currentSlug={article.slug}
            keywords={keywords}
          />
        </div>
      </article>
    </>
  );
}
