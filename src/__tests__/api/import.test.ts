import { POST } from '@/app/api/import/route';

describe('Import API Routes', () => {
  describe('Import Routes', () => {
    it('should export POST function from import route', () => {
      expect(typeof POST).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import import API routes without errors', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/import/route');
    }).not.toThrow();
  });
});
