import { GET, POST } from '@/app/api/supplements/route';
import { PUT as putLogs, DELETE as deleteLogs } from '@/app/api/supplements/logs/route';
import {
  GET as getTargets,
  POST as postTargets,
  DELETE as deleteTargets,
} from '@/app/api/supplements/targets/route';
import {
  GET as getCustomNutrients,
  POST as postCustomNutrients,
} from '@/app/api/supplements/custom-nutrients/route';
import { GET as searchDatabase } from '@/app/api/supplements/database/search/route';

describe('Supplements API Routes', () => {
  describe('Main Supplements Routes', () => {
    it('should export GET function from supplements route', () => {
      expect(typeof GET).toBe('function');
    });

    it('should export POST function from supplements route', () => {
      expect(typeof POST).toBe('function');
    });
  });

  describe('Supplement Logs Routes', () => {
    it('should export PUT function from supplements/logs route', () => {
      expect(typeof putLogs).toBe('function');
    });

    it('should export DELETE function from supplements/logs route', () => {
      expect(typeof deleteLogs).toBe('function');
    });
  });

  describe('Supplement Targets Routes', () => {
    it('should export GET function from supplements/targets route', () => {
      expect(typeof getTargets).toBe('function');
    });

    it('should export POST function from supplements/targets route', () => {
      expect(typeof postTargets).toBe('function');
    });

    it('should export DELETE function from supplements/targets route', () => {
      expect(typeof deleteTargets).toBe('function');
    });
  });

  describe('Custom Nutrients Routes', () => {
    it('should export GET function from supplements/custom-nutrients route', () => {
      expect(typeof getCustomNutrients).toBe('function');
    });

    it('should export POST function from supplements/custom-nutrients route', () => {
      expect(typeof postCustomNutrients).toBe('function');
    });
  });

  describe('Database Search Routes', () => {
    it('should export GET function from supplements/database/search route', () => {
      expect(typeof searchDatabase).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import all supplement API routes without errors', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/supplements/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/supplements/logs/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/supplements/targets/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/supplements/custom-nutrients/route');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/app/api/supplements/database/search/route');
    }).not.toThrow();
  });
});
