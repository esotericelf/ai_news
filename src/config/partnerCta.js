/**
 * Partner referral CTAs — rendered in the React app only (never injected by the LLM).
 * Set REACT_APP_PARTNER_CTA_ENABLED=true in .env.local / Netlify to show on articles.
 */

const fpr = process.env.REACT_APP_PARTNER_FPR || 'elf67';

function partnerUrl(path = '/') {
  const base = 'https://customgpt.ai';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const sep = normalized.includes('?') ? '&' : '?';
  return `${base}${normalized}${sep}fpr=${encodeURIComponent(fpr)}`;
}

/** @type {Record<string, { label: string, href: string, title: string, blurb: string }>} */
export const partnerCtaVariants = {
  default: {
    label: 'Build a custom AI assistant',
    title: 'CustomGPT — no-code RAG chatbots',
    href: partnerUrl('/'),
    blurb:
      'Turn your docs and site into a branded AI assistant without wiring your own stack.',
  },
  demo: {
    label: 'Try the live demo',
    title: 'See CustomGPT in action',
    href: partnerUrl('/demo/'),
    blurb: 'Walk through a live demo before you commit to a build.',
  },
  mit: {
    label: 'MIT entrepreneurship case study',
    title: 'How MIT used CustomGPT',
    href: partnerUrl('/customer/chatmtc-mit-entrepreneurship/'),
    blurb: 'Read how a university program deployed a custom GPT for founders.',
  },
  api: {
    label: 'Developer API',
    title: 'CustomGPT API',
    href: partnerUrl('/api/'),
    blurb: 'Integrate retrieval-augmented chat into your product via API.',
  },
  customerService: {
    label: 'Customer support AI',
    title: 'CustomGPT for support teams',
    href: partnerUrl('/solution/customer-service/'),
    blurb: 'Deflect repetitive tickets with answers grounded in your help center.',
  },
};

export const partnerCtaConfig = {
  enabled: process.env.REACT_APP_PARTNER_CTA_ENABLED === 'true',
  disclosure:
    process.env.REACT_APP_PARTNER_DISCLOSURE ||
    'Partner link — we may earn a commission if you sign up. Editorial reviews are written independently.',
  variants: partnerCtaVariants,
};
