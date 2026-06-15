import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArticleImage from '../components/ui/ArticleImage';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ErrorState from '../components/ui/ErrorState';
import ArticleBody from '../features/articles/ArticleBody';
import ArticleMatrixBadges from '../features/articles/ArticleMatrixBadges';
import ArticleSeoMatrix from '../features/articles/ArticleSeoMatrix';
import RelationalKeywordMatrix from '../features/articles/RelationalKeywordMatrix';
import ArticleMeta from '../features/articles/ArticleMeta';
import ArticlePartnerCta from '../features/articles/ArticlePartnerCta';
import ArticleSharePopover from '../features/articles/ArticleSharePopover';
import CommentsSection from '../features/comments/CommentsSection';
import RelatedArticles from '../features/articles/RelatedArticles';
import JsonLd from '../seo/JsonLd';
import SeoHead from '../seo/SeoHead';
import { absoluteArticleUrl, config } from '../config';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadArticleBySlug, loadArticles } from '../store/slices/articlesSlice';
import { buildArticleJsonLd, buildArticleBreadcrumbJsonLd } from '../utils/seo';
import { articleCategory, resolveArticleImageUrl } from '../utils/article';
import { seoMatrixLabels } from '../utils/seoMatrix';

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

  const title = article.seo_title || 'Untitled';
  const category = articleCategory(article);
  const canonical = absoluteArticleUrl(article.slug);
  const keywords = [
    ...new Set([...(article.target_keywords || []), ...seoMatrixLabels(article)]),
  ];
  const imageUrl = resolveArticleImageUrl(article);

  const jsonLd = [buildArticleJsonLd(article), buildArticleBreadcrumbJsonLd(article)];

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
            <ArticleMatrixBadges article={article} />
            <ArticleMeta article={article} />
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

          <div className="article-geo__layout">
            <div className="article-geo__content">
              <ArticleSeoMatrix article={article} />
              <ArticleBody html={article.body_html} />
            </div>

            <aside className="article-geo__topics" aria-label="Related topics">
              <RelationalKeywordMatrix article={article} />
            </aside>

            <div className="article-geo__partner">
              <ArticlePartnerCta article={article} />
            </div>

            <footer className="article-footer article-geo__footer">
              <p className="article-footer__attribution">
                Summary based on reporting from the original publisher.{' '}
                {article.canonical_url && (
                  <a href={article.canonical_url} rel="noopener noreferrer" target="_blank">
                    Read original article
                  </a>
                )}
              </p>
            </footer>

            <div className="article-geo__comments">
              <CommentsSection slug={article.slug} seoArticleId={article.id} />
            </div>

            <div className="article-geo__related">
              <RelatedArticles
                articles={list}
                currentSlug={article.slug}
                keywords={keywords}
              />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
