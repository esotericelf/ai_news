import { Helmet } from 'react-helmet-async';

/** Inject schema.org JSON-LD into document head via react-helmet-async. */
export default function JsonLd({ data }) {
  if (!data) return null;
  const graphs = Array.isArray(data) ? data : [data];
  const json = JSON.stringify(graphs.length === 1 ? graphs[0] : graphs);

  return (
    <Helmet>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  );
}
