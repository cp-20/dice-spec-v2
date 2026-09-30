import { normalizePathname } from './navigation';

describe('normalizePathname', () => {
  test('trailing slash を取り除く', () => {
    expect(normalizePathname('/expect/')).toBe('/expect');
    expect(normalizePathname('/analyze-logs/list/')).toBe('/analyze-logs/list');
  });

  test('valid pathnames を変更しない', () => {
    expect(normalizePathname('/expect')).toBe('/expect');
    expect(normalizePathname('/analyze-logs/list')).toBe('/analyze-logs/list');
  });
});
