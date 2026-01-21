import { POST } from '@/app/api/calorie-tracking/route';
import { GET as getCurrent } from '@/app/api/calorie-tracking/current/route';
import { POST as postGoalChange } from '@/app/api/calorie-tracking/goal-change/route';
import { GET as getHistory } from '@/app/api/calorie-tracking/history/route';
import { GET as getMonth } from '@/app/api/calorie-tracking/month/route';
import { GET as getStreaks } from '@/app/api/calorie-tracking/streaks/route';
import { GET as getToday } from '@/app/api/calorie-tracking/today/route';
import { GET as getWeekly } from '@/app/api/calorie-tracking/weekly/route';

describe('Calorie Tracking API Routes', () => {
  describe('Main Calorie Tracking Routes', () => {
    it('should export POST function from calorie-tracking route', () => {
      expect(typeof POST).toBe('function');
    });
  });

  describe('Current Calorie Tracking Routes', () => {
    it('should export GET function from calorie-tracking/current route', () => {
      expect(typeof getCurrent).toBe('function');
    });
  });

  describe('Goal Change Routes', () => {
    it('should export POST function from calorie-tracking/goal-change route', () => {
      expect(typeof postGoalChange).toBe('function');
    });
  });

  describe('History Routes', () => {
    it('should export GET function from calorie-tracking/history route', () => {
      expect(typeof getHistory).toBe('function');
    });
  });

  describe('Month Routes', () => {
    it('should export GET function from calorie-tracking/month route', () => {
      expect(typeof getMonth).toBe('function');
    });
  });

  describe('Streaks Routes', () => {
    it('should export GET function from calorie-tracking/streaks route', () => {
      expect(typeof getStreaks).toBe('function');
    });
  });

  describe('Today Routes', () => {
    it('should export GET function from calorie-tracking/today route', () => {
      expect(typeof getToday).toBe('function');
    });
  });

  describe('Weekly Routes', () => {
    it('should export GET function from calorie-tracking/weekly route', () => {
      expect(typeof getWeekly).toBe('function');
    });
  });

  // Basic smoke test - ensure routes don't throw on import
  it('should import all calorie tracking API routes without errors', () => {
    expect(() => {
      require('@/app/api/calorie-tracking/route');
      require('@/app/api/calorie-tracking/current/route');
      require('@/app/api/calorie-tracking/goal-change/route');
      require('@/app/api/calorie-tracking/history/route');
      require('@/app/api/calorie-tracking/month/route');
      require('@/app/api/calorie-tracking/streaks/route');
      require('@/app/api/calorie-tracking/today/route');
      require('@/app/api/calorie-tracking/weekly/route');
    }).not.toThrow();
  });
});
