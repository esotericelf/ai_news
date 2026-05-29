/**
 * Mirrors news.taxonomy.config.taxonomy_for_api() — used when the API
 * does not yet expose GET /api/taxonomy/ (older backend behind ngrok).
 */
const TAXONOMY_FALLBACK = {
  root_title: 'AI News Directory',
  default: { l1: 'trending-guides', l2: 'breakdowns-explainers' },
  categories: [
    {
      slug: 'tech-core-innovation',
      title: 'Tech & Core Innovation',
      nav_label: 'Explore AI Tech',
      subcategories: [
        { slug: 'llms-foundation-models', title: 'LLMs & Foundation Models', nav_label: 'LLMs & Models' },
        { slug: 'open-source-local-ai', title: 'Open Source & Local AI', nav_label: 'Run AI Locally' },
        {
          slug: 'autonomous-agents-robotics',
          title: 'Autonomous Agents & Robotics',
          nav_label: 'Agents & Robotics',
        },
        {
          slug: 'ai-infrastructure-hardware',
          title: 'AI Infrastructure & Hardware',
          nav_label: 'AI Chips & Infra',
        },
      ],
    },
    {
      slug: 'ai-tools-applications',
      title: 'AI Tools & Applications',
      nav_label: 'Find AI Tools',
      subcategories: [
        { slug: 'creative-design-ai', title: 'Creative & Design AI', nav_label: 'Generate Images & Video' },
        {
          slug: 'developer-coding-assistants',
          title: 'Developer & Coding Assistants',
          nav_label: 'Code with AI',
        },
        {
          slug: 'productivity-enterprise',
          title: 'Productivity & Enterprise Automation',
          nav_label: 'Automate Work',
        },
        {
          slug: 'data-scrapers-automation',
          title: 'Data, Scrapers & Automation',
          nav_label: 'Scrape & Automate Data',
        },
      ],
    },
    {
      slug: 'industry-impact-business',
      title: 'Industry Impact & Business',
      nav_label: 'AI in Business',
      subcategories: [
        { slug: 'finance-healthcare', title: 'AI in Finance & Healthcare', nav_label: 'Finance & Health AI' },
        { slug: 'legal-ethics-regulation', title: 'Legal, Ethics & Regulation', nav_label: 'AI Law & Ethics' },
        { slug: 'job-market-enterprise', title: 'Job Market & Enterprise Shift', nav_label: 'Jobs & Adoption' },
      ],
    },
    {
      slug: 'trending-guides',
      title: 'Trending & Practical Guides',
      nav_label: 'Learn & Catch Up',
      subcategories: [
        { slug: 'daily-weekly-digests', title: 'Daily & Weekly AI Digests', nav_label: 'AI News Roundups' },
        { slug: 'step-by-step-tutorials', title: 'Step-by-Step Tutorials', nav_label: 'How-To Guides' },
        { slug: 'breakdowns-explainers', title: 'AI Breakdowns & Explainers', nav_label: 'What Is… Explainers' },
      ],
    },
  ],
  entities: [
    { slug: 'openai', title: 'OpenAI' },
    { slug: 'anthropic', title: 'Anthropic' },
    { slug: 'google', title: 'Google' },
    { slug: 'meta', title: 'Meta' },
    { slug: 'nvidia', title: 'NVIDIA' },
    { slug: 'microsoft', title: 'Microsoft' },
    { slug: 'hugging-face', title: 'Hugging Face' },
    { slug: 'ollama', title: 'Ollama' },
    { slug: 'langchain', title: 'LangChain' },
    { slug: 'scrapegraphai', title: 'ScrapeGraphAI' },
    { slug: 'playwright', title: 'Playwright' },
    { slug: 'midjourney', title: 'Midjourney' },
    { slug: 'stable-diffusion', title: 'Stable Diffusion' },
    { slug: 'cursor', title: 'Cursor' },
    { slug: 'github-copilot', title: 'GitHub Copilot' },
  ],
};

const FALLBACK_TOOL_SLUGS = new Set([
  'hugging-face',
  'ollama',
  'langchain',
  'scrapegraphai',
  'playwright',
  'midjourney',
  'stable-diffusion',
  'cursor',
  'github-copilot',
]);

export function fallbackMatrixFromTree(tree = TAXONOMY_FALLBACK) {
  const companies = [];
  const tools = [];
  for (const e of tree.entities ?? []) {
    const row = { slug: e.slug, title: e.title, article_count: 0 };
    if (FALLBACK_TOOL_SLUGS.has(e.slug)) {
      tools.push(row);
    } else {
      companies.push(row);
    }
  }
  return { companies, tools, industries: [] };
}

export default TAXONOMY_FALLBACK;
