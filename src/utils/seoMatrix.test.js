import { matrixEntityBadges, normalizeEntities } from './seoMatrix';

describe('seoMatrix', () => {
  test('normalizeEntities assigns matrixType for links', () => {
    const rows = normalizeEntities([{ name: 'OpenAI', slug: 'openai' }], 'company');
    expect(rows).toEqual([{ label: 'OpenAI', slug: 'openai', matrixType: 'company' }]);
  });

  test('matrixEntityBadges includes companies, tools, and industries', () => {
    const badges = matrixEntityBadges({
      companies: [{ name: 'OpenAI', slug: 'openai' }],
      tools: [{ name: 'Ollama', slug: 'ollama' }],
      industries: [{ name: 'Healthcare', slug: 'healthcare' }],
    });
    expect(badges.map((b) => b.matrixType)).toEqual(['company', 'tool', 'industry']);
  });
});
