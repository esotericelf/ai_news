/**
 * Human-readable site directory tree (footer + /sitemap page).
 * Internal: `to` or `search`. External/proxied: `href`.
 */

export const SITEMAP_PAGE_SECTIONS = [
  {
    id: 'main-station',
    title: 'Main Station',
    description: 'Primary entry points across the publication.',
    items: [
      { label: 'Home', to: '/', hint: 'Latest AI & technology coverage' },
      { label: 'The Master Data Report', to: '/report', hint: 'Programmatic industry analysis' },
      { label: 'Browse Topics', to: '/topics', hint: 'Categories, companies, tools & industries' },
      {
        label: 'RSS Feed',
        href: '/api/published/?ordering=-generated_at',
        hint: 'Machine-readable article stream',
      },
    ],
  },
  {
    id: 'clusters',
    title: 'Core Tech Exploration Clusters',
    description: 'Major research themes — each branch opens a filtered article archive.',
    items: [
      { label: 'LLMs', search: 'LLMs', hint: 'Large language models & foundation AI' },
      { label: 'Computer Vision', search: 'computer vision', hint: 'Vision & multimodal systems' },
      { label: 'Robotaxis', search: 'robotaxis', hint: 'Autonomous driving & mobility' },
      { label: 'AI Agents', search: 'AI agents', hint: 'Agentic workflows & tool use' },
      { label: 'AI Infrastructure', search: 'cloud computing', hint: 'Chips, data centers & platforms' },
      { label: 'Healthcare AI', search: 'healthcare AI', hint: 'Clinical & medical applications' },
    ],
  },
  {
    id: 'engineering',
    title: 'System Engineering & Documentation',
    description: 'APIs, policies, and operational references for integrators.',
    items: [
      { label: 'API Documentation', href: '/docs/api', hint: 'REST API reference' },
      { label: 'Privacy & editorial policy', to: '/topics', hint: 'How we curate and present news' },
      { label: 'Security overview', href: '/health/', hint: 'Service availability & headers' },
      { label: 'Architecture overview', href: '/docs/api', hint: 'Integration surface & data model' },
      { label: 'System status', href: '/health/', hint: 'Live health check endpoint' },
      { label: 'XML sitemap (crawlers)', href: '/sitemap.xml', hint: 'Search-engine XML index' },
    ],
  },
];

/** Compact footer subset derived from the same directory model. */
export const FOOTER_SITEMAP_SECTIONS = [
  {
    id: 'core',
    title: 'Core Pages',
    items: SITEMAP_PAGE_SECTIONS[0].items.filter((item) =>
      ['Home', 'The Master Data Report'].includes(item.label)
    ).concat([
      { label: 'About', to: '/topics', hint: 'Editorial scope & coverage' },
      { label: 'Archive', to: '/', hint: 'Latest published stories' },
    ]),
  },
  {
    id: 'clusters',
    title: 'Top Tech Clusters',
    items: SITEMAP_PAGE_SECTIONS[1].items.slice(0, 4),
  },
];
