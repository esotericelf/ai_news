import {
  normalizeKeyMetrics,
  normalizeThreeSentenceSummary,
} from '../../utils/seoMatrix';

export function ArticleSummary({ article }) {
  const sentences = normalizeThreeSentenceSummary(article?.three_sentence_summary);
  if (!sentences.length) return null;

  return (
    <div className="article-summary prose prose-slate" aria-label="Article summary">
      {sentences.map((sentence, index) => (
        <p key={index}>{sentence}</p>
      ))}
    </div>
  );
}

export function ArticleKeyMetrics({ article }) {
  const metrics = normalizeKeyMetrics(article?.key_metrics);
  if (!metrics.length) return null;

  return (
    <section className="article-key-metrics" aria-label="Key Metrics">
      <h2 className="article-key-metrics__title">Key Metrics</h2>
      <table>
        <tbody>
          {metrics.map((row, index) => (
            <tr key={index}>
              <th scope="row">{row.label}</th>
              {row.value ? <td>{row.value}</td> : <td aria-hidden="true">—</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** Summary and Key Metrics for article body (badges live in the page header / cards). */
export default function ArticleSeoMatrix({ article }) {
  return (
    <>
      <ArticleSummary article={article} />
      <ArticleKeyMetrics article={article} />
    </>
  );
}
