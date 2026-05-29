import { MATRIX_FILTER_PARAMS, MATRIX_SEGMENTS, matrixUrl } from './config';

describe('matrix routing', () => {
  test('matrixUrl builds entity paths', () => {
    expect(matrixUrl('company', 'openai')).toBe('/companies/openai');
    expect(matrixUrl('tool', 'ollama')).toBe('/tools/ollama');
    expect(matrixUrl('industry', 'healthcare')).toBe('/industries/healthcare');
  });

  test('matrixUrl encodes slugs', () => {
    expect(matrixUrl('company', 'acme corp')).toBe('/companies/acme%20corp');
  });

  test('filter params map to published API', () => {
    expect(MATRIX_SEGMENTS.company).toBe('companies');
    expect(MATRIX_FILTER_PARAMS.tool).toBe('tool');
    expect(MATRIX_FILTER_PARAMS.industry).toBe('industry');
  });
});
