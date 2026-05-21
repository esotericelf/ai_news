import { partnerCtaConfig } from '../../config/partnerCta';
import { getPartnerCtaForArticle } from '../../utils/partnerCta';

export default function ArticlePartnerCta({ article }) {
  const cta = getPartnerCtaForArticle(article);
  if (!cta) return null;

  return (
    <aside
      className="article-partner-cta"
      aria-label="Partner resource"
      data-partner-cta="customgpt"
    >
      <p className="article-partner-cta__eyebrow">Related tool</p>
      <h2 className="article-partner-cta__title">{cta.title}</h2>
      <p className="article-partner-cta__blurb">{cta.blurb}</p>
      <a
        className="article-partner-cta__link"
        href={cta.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        {cta.label}
      </a>
      <p className="article-partner-cta__disclosure">{partnerCtaConfig.disclosure}</p>
    </aside>
  );
}
