import { GET, POST } from '@/app/api/weight-logs/route';
import { GET as getLatest } from '@/app/api/weight-logs/latest/route';

describe('Weight Logs API Routes', () => {
  describe('Weight Logs Routes', () => {
    it('should export GET function from weight-logs route', () => {
      expect(typeof GET).toBe('function');
    });

    it('should export POST function from weight-logs route', () => {
      expect(typeof POST).toBe('function');
    });
  });

  describe('Latest Weight Routes', () => {
    it('should export GET function from weight-logs/latest route', () => {
      expect(typeof getLatest).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import all weight logs API routes without errors', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/weight-logs/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/weight-logs/latest/route');
    }).not.toThrow();
  });
});
