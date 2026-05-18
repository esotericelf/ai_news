export function findL1(taxonomy, slug) {
  return taxonomy?.categories?.find((c) => c.slug === slug);
}

export function findL2(l1, slug) {
  return l1?.subcategories?.find((s) => s.slug === slug);
}

export function flattenBrowseItems(taxonomy, tags = []) {
  const items = [];
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
    items.push({
      type: 'entity',
      slug: entity.slug,
      title: entity.title,
      path: `/tags/${entity.slug}`,
      searchText: `${entity.title} ${entity.slug}`.toLowerCase(),
    });
  }
  for (const t of tags) {
    if (items.some((i) => i.type === 'entity' && i.slug === t.slug)) continue;
    items.push({
      type: 'tag',
      slug: t.slug,
      title: t.title,
      articleCount: t.article_count,
      path: `/tags/${t.slug}`,
      searchText: `${t.title} ${t.slug}`.toLowerCase(),
    });
  }
  return items;
}

export function filterBrowseItems(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.searchText.includes(q));
}
