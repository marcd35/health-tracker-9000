import { GET } from '@/app/api/daily-summary/[date]/route';

describe('Daily Summary API Routes', () => {
  describe('Daily Summary by Date Routes', () => {
    it('should export GET function from daily-summary/[date] route', () => {
      expect(typeof GET).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import daily summary API routes without errors', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/daily-summary/[date]/route');
    }).not.toThrow();
  });
});
