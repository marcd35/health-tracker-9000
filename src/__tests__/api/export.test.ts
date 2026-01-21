import { GET } from '@/app/api/export/route';

describe('Export API Routes', () => {
  describe('Export Routes', () => {
    it('should export GET function from export route', () => {
      expect(typeof GET).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import export API routes without errors', () => {
    expect(() => {
      require('@/app/api/export/route');
    }).not.toThrow();
  });
});
