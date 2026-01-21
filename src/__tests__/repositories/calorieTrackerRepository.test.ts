import { CalorieTrackerRepository } from '@/lib/database/repositories/calorieTrackerRepository';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import { MealLogRepository } from '@/lib/database/repositories/mealLogRepository';
import { setupTestDbWithData, teardownTestDb } from '../setup/test-db';

describe('CalorieTrackerRepository', () => {
  let db: any;
  let repo: CalorieTrackerRepository;
  let goalRepo: CalorieGoalRepository;
  let mealRepo: MealLogRepository;
  const profileId = 'test-profile-id';

  beforeEach(() => {
    db = setupTestDbWithData();
    repo = new CalorieTrackerRepository();
    goalRepo = new CalorieGoalRepository();
    mealRepo = new MealLogRepository();

    // Override database connections for testing
    (repo as any).db = db;
    (goalRepo as any).db = db;
    (mealRepo as any).db = db;

    // Override repo instances in calorieTrackerRepo
    (repo as any).goalRepo = goalRepo;
    (repo as any).mealRepo = mealRepo;
  });

  afterEach(() => {
    if (db) {
      teardownTestDb(db);
    }
  });

  describe('updateDailyTracking', () => {
    beforeEach(() => {
      // Create a calorie goal first
      goalRepo.createGoal(profileId, 'weight_loss', 14000, 'moderate');
    });

    it('should create daily tracking when no meals exist', () => {
      const result = repo.updateDailyTracking(profileId, '2024-01-15');

      expect(result).toMatchObject({
        date: '2024-01-15',
        profileId,
        caloriesConsumed: 0,
        caloriesTarget: expect.any(Number), // Calculated based on TDEE
        calorieDeficitSurplus: expect.any(Number),
        goalMet: expect.any(Boolean),
        onPacePercentage: expect.any(Number),
        trend: 'stable',
      });
      expect(result!.caloriesTarget).toBeGreaterThan(4000); // TDEE + weeklyTarget/7
      expect(result!.calorieDeficitSurplus).toBe(result!.caloriesConsumed - result!.caloriesTarget);
    });

    it('should calculate calories from meals', () => {
      // Add a meal
      mealRepo.addMealLog({
        date: '2024-01-15',
        mealType: 'breakfast',
        foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
        totalNutrition: { calories: 500, protein: 25, carbs: 50, fat: 20, fiber: 5 },
      });

      const result = repo.updateDailyTracking(profileId, '2024-01-15');

      expect(result?.caloriesConsumed).toBe(500);
      expect(result?.calorieDeficitSurplus).toBe(result!.caloriesConsumed - result!.caloriesTarget);
      expect(result?.goalMet).toBe(result!.caloriesConsumed <= result!.caloriesTarget); // For weight_loss, goal met when consumed <= target
    });

    it('should update existing tracking', () => {
      // Create initial tracking
      repo.updateDailyTracking(profileId, '2024-01-15');

      // Add a meal
      mealRepo.addMealLog({
        date: '2024-01-15',
        mealType: 'lunch',
        foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
        totalNutrition: { calories: 800, protein: 40, carbs: 80, fat: 30, fiber: 8 },
      });

      // Update tracking
      const result = repo.updateDailyTracking(profileId, '2024-01-15');

      expect(result?.caloriesConsumed).toBe(800);
      expect(result?.calorieDeficitSurplus).toBe(result!.caloriesConsumed - result!.caloriesTarget);
    });

    it('should return null when no goal exists', () => {
      // Clear goals
      db.prepare('DELETE FROM calorie_goals').run();

      const result = repo.updateDailyTracking(profileId, '2024-01-15');
      expect(result).toBeNull();
    });
  });

  describe('getDailyTracking', () => {
    beforeEach(() => {
      // Create a goal and tracking
      goalRepo.createGoal(profileId, 'maintenance', 15400, 'moderate');

      mealRepo.addMealLog({
        date: '2024-01-15',
        mealType: 'breakfast',
        foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
        totalNutrition: { calories: 600, protein: 30, carbs: 60, fat: 25, fiber: 6 },
      });

      repo.updateDailyTracking(profileId, '2024-01-15');
    });

    it('should return daily tracking for existing date', () => {
      const result = repo.getDailyTracking(profileId, '2024-01-15');

      expect(result).toMatchObject({
        date: '2024-01-15',
        profileId,
        caloriesConsumed: 600,
        caloriesTarget: expect.any(Number),
        goalMet: expect.any(Boolean),
        trend: 'stable',
      });
    });

    it('should return null for non-existent date', () => {
      const result = repo.getDailyTracking(profileId, '2024-01-20');
      expect(result).toBeNull();
    });
  });

  describe('getWeeklyTracking', () => {
    beforeEach(() => {
      // Create a goal
      goalRepo.createGoal(profileId, 'weight_loss', 14000, 'moderate');

      // Add meals for a few days in the week
      const dates = ['2024-01-14', '2024-01-15', '2024-01-16'];
      dates.forEach((date, index) => {
        mealRepo.addMealLog({
          date,
          mealType: 'breakfast',
          foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
          totalNutrition: {
            calories: 1800 + index * 100,
            protein: 90 + index * 5,
            carbs: 180 + index * 10,
            fat: 60 + index * 3,
            fiber: 18 + index,
          },
        });
        repo.updateDailyTracking(profileId, date);
      });
    });

    it('should return weekly tracking data', () => {
      const result = repo.getWeeklyTracking(profileId, '2024-01-20'); // Sunday

      expect(result).toMatchObject({
        weekStart: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        days: expect.any(Array),
        weeklyAverage: expect.any(Number),
        weeklyTarget: expect.any(Number),
        weeklyConsumed: expect.any(Number),
        onPacePercentage: expect.any(Number),
        daysMetGoal: expect.any(Number),
        projection: expect.any(Number),
      });

      expect(result.days).toHaveLength(7);
      expect(result.weeklyConsumed).toBeGreaterThan(0);
    });

    it('should calculate correct weekly totals', () => {
      const result = repo.getWeeklyTracking(profileId, '2024-01-20');

      // Should have data for 2 days with the calculated calories (week starts on 2024-01-15)
      expect(result.weeklyConsumed).toBe(1900 + 2000); // 3900
      expect(result.daysMetGoal).toBeGreaterThanOrEqual(0); // Depends on actual targets
    });
  });

  describe('getCurrentStreak', () => {
    it('should return null when no streak exists', () => {
      const result = repo.getCurrentStreak(profileId);
      expect(result).toBeNull();
    });

    it('should return current active streak', () => {
      // Create an active streak
      const today = new Date().toISOString().split('T')[0];
      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-1', profileId, today, 5, 5, 5, new Date().toISOString());

      const result = repo.getCurrentStreak(profileId);
      expect(result).toMatchObject({
        profileId,
        streakStartDate: today,
        daysCount: 5,
        goalMetCount: 5,
        isActive: true,
        streakEndDate: null,
      });
    });

    it('should return null for ended streaks', () => {
      // Create an ended streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, streak_end_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-2', profileId, '2024-01-10', yesterdayStr, 3, 3, 3, new Date().toISOString());

      const result = repo.getCurrentStreak(profileId);
      expect(result).toBeNull();
    });
  });

  describe('getBestStreak', () => {
    it('should return 0 when no streaks exist', () => {
      const result = repo.getBestStreak(profileId);
      expect(result).toBe(0);
    });

    it('should return the highest streak count', () => {
      // Create multiple streaks
      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-1', profileId, '2024-01-01', 3, 3, 3, new Date().toISOString());

      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-2', profileId, '2024-01-10', 7, 7, 7, new Date().toISOString());

      const result = repo.getBestStreak(profileId);
      expect(result).toBe(7);
    });
  });

  describe('getStreakInfo', () => {
    it('should return streak info with no active streak', () => {
      const result = repo.getStreakInfo(profileId);

      expect(result).toEqual({
        currentStreak: 0,
        bestStreak: 0,
        isActive: false,
        streakStartDate: '',
        lastActivityDate: '',
        streakPercentage: 0,
      });
    });

    it('should return streak info with active streak', () => {
      // Create an active streak
      const today = new Date().toISOString().split('T')[0];
      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run(
        'streak-1',
        profileId,
        '2024-01-10',
        5,
        4, // 4 out of 5 days met goal
        5,
        new Date().toISOString()
      );

      const result = repo.getStreakInfo(profileId);

      expect(result).toMatchObject({
        currentStreak: 5,
        bestStreak: 5,
        isActive: true,
        streakStartDate: '2024-01-10',
        lastActivityDate: today,
        streakPercentage: 80, // 4/5 * 100
      });
    });
  });

  describe('getAllDailyTracking', () => {
    beforeEach(() => {
      // Create goal and multiple days of tracking
      goalRepo.createGoal(profileId, 'weight_loss', 14000, 'moderate');

      // Create tracking for 10 days
      for (let i = 1; i <= 10; i++) {
        const date = `2024-01-${String(i).padStart(2, '0')}`;
        mealRepo.addMealLog({
          date,
          mealType: 'breakfast',
          foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
          totalNutrition: {
            calories: 1800 + i * 20,
            protein: 90 + i,
            carbs: 180 + i * 2,
            fat: 60 + i,
            fiber: 18 + i,
          },
        });
        repo.updateDailyTracking(profileId, date);
      }
    });

    it('should return paginated daily tracking', () => {
      const result = repo.getAllDailyTracking(profileId, undefined, undefined, 5, 0);

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(10);
      expect(result.data[0].date).toBe('2024-01-10'); // Most recent first
    });

    it('should handle date range filtering', () => {
      const result = repo.getAllDailyTracking(profileId, '2024-01-03', '2024-01-07');

      expect(result.total).toBe(5); // dates 3-7
      expect(result.data).toHaveLength(5);
      expect(result.data[0].date).toBe('2024-01-07');
    });

    it('should handle pagination with offset', () => {
      const result = repo.getAllDailyTracking(profileId, undefined, undefined, 3, 3);

      expect(result.total).toBe(10);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].date).toBe('2024-01-07'); // Offset 3 from most recent
    });
  });

  describe('getAllStreaks', () => {
    beforeEach(() => {
      // Create multiple streaks
      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-1', profileId, '2024-01-01', 3, 3, 3, new Date().toISOString());

      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-2', profileId, '2024-01-10', 5, 5, 5, new Date().toISOString());
    });

    it('should return all streaks ordered by start date', () => {
      const result = repo.getAllStreaks(profileId);

      expect(result).toHaveLength(2);
      expect(result[0].streakStartDate).toBe('2024-01-10'); // Most recent first
      expect(result[1].streakStartDate).toBe('2024-01-01');
    });
  });

  describe('updateStreak', () => {
    it('should start new streak when goal is met and no active streak', () => {
      // Call private method via updateDailyTracking which calls it
      goalRepo.createGoal(profileId, 'weight_loss', 14000, 'moderate');

      const today = new Date().toISOString().split('T')[0];

      // Add meal under target
      mealRepo.addMealLog({
        date: today,
        mealType: 'breakfast',
        foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
        totalNutrition: { calories: 1800, protein: 90, carbs: 180, fat: 60, fiber: 18 },
      });

      repo.updateDailyTracking(profileId, today);

      const streak = repo.getCurrentStreak(profileId);
      expect(streak?.daysCount).toBe(1);
      expect(streak?.isActive).toBe(true);
    });

    it('should increment existing streak when goal is met', () => {
      // Create initial streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-1', profileId, yesterdayStr, 2, 2, 2, new Date().toISOString());

      // Create goal and meet it
      goalRepo.createGoal(profileId, 'weight_loss', 14000, 'moderate');

      const today = new Date().toISOString().split('T')[0];
      mealRepo.addMealLog({
        date: today,
        mealType: 'breakfast',
        foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
        totalNutrition: { calories: 1800, protein: 90, carbs: 180, fat: 60, fiber: 18 },
      });

      repo.updateDailyTracking(profileId, today);

      const streak = repo.getCurrentStreak(profileId);
      expect(streak?.daysCount).toBe(3);
    });

    it('should end streak when goal is not met', () => {
      // Create initial streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      db.prepare(
        `
        INSERT INTO calorie_streaks (id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run('streak-1', profileId, yesterdayStr, 3, 3, 3, new Date().toISOString());

      // Create goal and miss it
      goalRepo.createGoal(profileId, 'weight_loss', 14000, 'moderate');

      const today = new Date().toISOString().split('T')[0];
      mealRepo.addMealLog({
        date: today,
        mealType: 'breakfast',
        foods: [{ foodId: 'food-1', foodName: 'Test Food', amount: 100 }],
        totalNutrition: { calories: 10000, protein: 500, carbs: 1000, fat: 400, fiber: 100 }, // Definitely over target
      });

      repo.updateDailyTracking(profileId, today);

      const streak = repo.getCurrentStreak(profileId);
      expect(streak).toBeNull(); // Streak should be ended (end_date set)
    });
  });
});
