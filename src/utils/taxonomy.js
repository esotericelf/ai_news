import { matrixUrl } from '../config';

export function findL1(taxonomy, slug) {
  return taxonomy?.categories?.find((c) => c.slug === slug);
}

export function findL2(l1, slug) {
  return l1?.subcategories?.find((s) => s.slug === slug);
}

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

function pushMatrixItem(items, seen, { matrixType, slug, title, articleCount }) {
  const key = `${matrixType}:${slug}`;
  if (!slug || seen.has(key)) return;
  seen.add(key);
  items.push({
    type: matrixType,
    slug,
    title,
    articleCount,
    path: matrixUrl(matrixType, slug),
    searchText: `${title} ${slug} ${matrixType}`.toLowerCase(),
  });
}

export function flattenBrowseItems(taxonomy, matrix = {}) {
  const items = [];
  const seen = new Set();

  for (const l1 of taxonomy?.categories ?? []) {
    items.push({
      type: 'category',
      slug: l1.slug,
      title: l1.title,
      navLabel: l1.nav_label,
      path: `/category/${l1.slug}`,
      searchText: `${l1.title} ${l1.nav_label} ${l1.slug}`.toLowerCase(),
    });
    for (const l2 of l1.subcategories ?? []) {
      items.push({
        type: 'subcategory',
        slug: l2.slug,
        title: l2.title,
        navLabel: l2.nav_label,
        parentSlug: l1.slug,
        parentTitle: l1.nav_label || l1.title,
        path: `/category/${l1.slug}/${l2.slug}`,
        searchText: `${l2.title} ${l2.nav_label} ${l2.slug} ${l1.title}`.toLowerCase(),
      });
    }
  }

  for (const entity of taxonomy?.entities ?? []) {
    const matrixType = FALLBACK_TOOL_SLUGS.has(entity.slug) ? 'tool' : 'company';
    pushMatrixItem(items, seen, {
      matrixType,
      slug: entity.slug,
      title: entity.title,
    });
  }

  for (const c of matrix.companies ?? []) {
    pushMatrixItem(items, seen, {
      matrixType: 'company',
      slug: c.slug,
      title: c.title,
      articleCount: c.article_count,
    });
  }
  for (const t of matrix.tools ?? []) {
    pushMatrixItem(items, seen, {
      matrixType: 'tool',
      slug: t.slug,
      title: t.title,
      articleCount: t.article_count,
    });
  }
  for (const i of matrix.industries ?? []) {
    pushMatrixItem(items, seen, {
      matrixType: 'industry',
      slug: i.slug,
      title: i.title,
      articleCount: i.article_count,
    });
  }

  return items;
}

export function filterBrowseItems(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.searchText.includes(q));
}
