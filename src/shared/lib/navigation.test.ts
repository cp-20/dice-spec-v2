import { isNavPath, normalizePathname } from './navigation';

describe('normalizePathname', () => {
  test('/en prefix を取り除く', () => {
    expect(normalizePathname('/en/expect')).toBe('/expect');
    expect(normalizePathname('/en/analyze-logs/list')).toBe('/analyze-logs/list');
  });

  test('/ja prefix を取り除く', () => {
    expect(normalizePathname('/ja/expect')).toBe('/expect');
    expect(normalizePathname('/ja/analyze-logs/list')).toBe('/analyze-logs/list');
  });

  test('trailing slash を取り除く', () => {
    expect(normalizePathname('/expect/')).toBe('/expect');
    expect(normalizePathname('/analyze-logs/list/')).toBe('/analyze-logs/list');
  });

  test('valid pathnames を変更しない', () => {
    expect(normalizePathname('/expect')).toBe('/expect');
    expect(normalizePathname('/analyze-logs/list')).toBe('/analyze-logs/list');
  });
});
