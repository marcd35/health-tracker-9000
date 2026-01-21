import { GET, PUT } from '@/app/api/profile/route';

describe('Profile API Routes', () => {
  it('should export GET function from profile route', () => {
    expect(typeof GET).toBe('function');
  });

  it('should export PUT function from profile route', () => {
    expect(typeof PUT).toBe('function');
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import profile API routes without errors', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/profile/route');
    }).not.toThrow();
  });
});
