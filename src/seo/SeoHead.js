import { Helmet } from 'react-helmet-async';
import { config } from '../config';

export default function SeoHead({
  title,
  description,
  canonical,
  image,
  type = 'website',
  keywords = [],
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${config.siteName}` : config.siteName;
  const desc = description || config.siteDescription;
  const keywordStr = keywords.length ? keywords.join(', ') : undefined;

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywordStr && <meta name="keywords" content={keywordStr} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:site_name" content={config.siteName} />
      <meta property="og:title" content={title || config.siteName} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title || config.siteName} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
