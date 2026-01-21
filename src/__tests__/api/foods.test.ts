import { GET as getFoodById } from '@/app/api/foods/[id]/route';
import { POST as postImport } from '@/app/api/foods/import/route';
import { GET as getRecent } from '@/app/api/foods/recent/route';
import { GET as getSearch } from '@/app/api/foods/search/route';
import { GET as getUSDAFood } from '@/app/api/foods/usda/[fdcId]/route';
import { GET as getUSDASearch } from '@/app/api/foods/usda-search/route';

describe('Foods API Routes', () => {
  describe('Food by ID Routes', () => {
    it('should export GET function from foods/[id] route', () => {
      expect(typeof getFoodById).toBe('function');
    });
  });

  describe('Import Routes', () => {
    it('should export POST function from foods/import route', () => {
      expect(typeof postImport).toBe('function');
    });
  });

  describe('Recent Foods Routes', () => {
    it('should export GET function from foods/recent route', () => {
      expect(typeof getRecent).toBe('function');
    });
  });

  describe('Search Routes', () => {
    it('should export GET function from foods/search route', () => {
      expect(typeof getSearch).toBe('function');
    });
  });

  describe('USDA Food Routes', () => {
    it('should export GET function from foods/usda/[fdcId] route', () => {
      expect(typeof getUSDAFood).toBe('function');
    });
  });

  describe('USDA Search Routes', () => {
    it('should export GET function from foods/usda-search route', () => {
      expect(typeof getUSDASearch).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import all foods API routes without errors', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/foods/[id]/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/foods/import/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/foods/recent/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/foods/search/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/foods/usda/[fdcId]/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/foods/usda-search/route');
    }).not.toThrow();
  });
});
