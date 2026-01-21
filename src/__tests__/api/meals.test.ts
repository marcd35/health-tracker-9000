import { POST } from '@/app/api/meals/route';
import { GET } from '@/app/api/meals/[id]/route';
import { GET as getFavorites } from '@/app/api/meals/favorites/route';

describe('Meals API Routes', () => {
  it('should export POST function from meals route', () => {
    expect(typeof POST).toBe('function');
  });

  it('should export GET function from meals/[id] route', () => {
    expect(typeof GET).toBe('function');
  });

  it('should export GET function from meals/favorites route', () => {
    expect(typeof getFavorites).toBe('function');
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import all meal API routes without errors', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/meals/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/meals/[id]/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/meals/favorites/route');
    }).not.toThrow();
  });
});
