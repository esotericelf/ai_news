/**
 * Footer directory tree — human-readable site architecture (not raw XML).
 * Internal routes use `to`; external/proxied paths use `href`.
 */

export const FOOTER_SITEMAP_SECTIONS = [
  {
    id: 'core',
    title: 'Core Pages',
    items: [
      { label: 'Home', to: '/' },
      { label: 'Master Report', to: '/report' },
      { label: 'About', to: '/topics', hint: 'Editorial scope & coverage' },
      { label: 'Archive', to: '/', hint: 'Latest published stories' },
    ],
  },
  {
    id: 'clusters',
    title: 'Top Tech Clusters',
    items: [
      { label: 'LLMs', search: 'LLMs', hint: 'Large language models & foundation AI' },
      { label: 'Computer Vision', search: 'computer vision', hint: 'Vision models & multimodal AI' },
      { label: 'Robotaxis', search: 'robotaxis', hint: 'Autonomous driving & mobility' },
      { label: 'AI Agents', search: 'AI agents', hint: 'Agentic workflows & tool use' },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    items: [
      { label: 'API Documentation', href: '/docs/api', hint: 'REST API reference' },
      { label: 'RSS Feed', href: '/api/published/?ordering=-generated_at', hint: 'Latest articles feed' },
      { label: 'System Status', href: '/health/', hint: 'Service health check' },
      { label: 'XML Sitemap', href: '/sitemap.xml', hint: 'Crawler index (XML)' },
    ],
  },
];
