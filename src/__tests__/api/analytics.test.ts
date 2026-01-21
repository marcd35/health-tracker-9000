import { GET } from '@/app/api/analytics/weekly/route';

describe('Analytics API Routes', () => {
  describe('Weekly Analytics Routes', () => {
    it('should export GET function from analytics/weekly route', () => {
      expect(typeof GET).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import analytics API routes without errors', () => {
    expect(() => {
      require('@/app/api/analytics/weekly/route');
    }).not.toThrow();
  });
});
