import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import type {
  DailyCalorieTracking,
  WeeklyProgressData,
  CalorieStreak,
  MonthlyCalorieData,
  WeeklyMetrics,
  StreakInfo,
} from '@/lib/types/calorieTracking';
import { MealLogRepository } from './mealLogRepository';
import { CalorieGoalRepository } from './calorieGoalRepository';

export class CalorieTrackerRepository {
  private db = getDatabase();
  private mealRepo = new MealLogRepository();
  private goalRepo = new CalorieGoalRepository();

  /**
   * Update daily calorie tracking for a specific date
   * Called after meals are added/deleted
   */
  updateDailyTracking(profileId: string, date: string): DailyCalorieTracking | null {
    const goal = this.goalRepo.getCurrentGoal(profileId);
    if (!goal) return null;

    const meals = this.mealRepo.getMealLogsByDate(date);
    const caloriesConsumed = this.calculateCaloriesFromMeals(meals);
    const caloriesTarget = goal.dailyCalorieTarget;

    const calorieDeficitSurplus = caloriesConsumed - caloriesTarget;
    const goalMet = this.determineGoalMet(goal.goalType, caloriesConsumed, caloriesTarget);

    // Get weekly data for calculations
    const weekData = this.getWeekForDate(date);
    const dayIndex = this.getDayIndexInWeek(date);

    let weeklyTotalConsumed = 0;
    let weeklyTotalTarget = 0;
    for (let i = 0; i < 7; i++) {
      if (i <= dayIndex) {
        const dayTracking = this.getDailyTracking(profileId, weekData.days[i]);
        if (dayTracking && i < dayIndex) {
          // Previous days in week
          weeklyTotalConsumed += dayTracking.caloriesConsumed;
          weeklyTotalTarget += dayTracking.caloriesTarget;
        } else if (i === dayIndex) {
          // Current day being updated
          weeklyTotalConsumed += caloriesConsumed;
          weeklyTotalTarget += caloriesTarget;
        }
      }
    }

    const weeklyAverage =
      dayIndex > 0 ? Math.round(weeklyTotalConsumed / (dayIndex + 1)) : caloriesConsumed;
    const onPacePercentage = this.calculateOnPacePercentage(
      goal.goalType,
      weeklyTotalConsumed,
      weeklyTotalTarget,
      dayIndex + 1
    );
    const trend = this.calculateTrend(profileId, date, caloriesConsumed);

    const id = uuidv4();
    const now = new Date().toISOString();

    // Check if tracking already exists for this date
    const existing = this.db
      .prepare('SELECT id FROM daily_calorie_tracking WHERE date = ?')
      .get(date) as any;

    if (existing) {
      const updateStmt = this.db.prepare(`
        UPDATE daily_calorie_tracking SET
          calories_consumed = ?,
          calories_target = ?,
          calories_deficit_surplus = ?,
          goal_met = ?,
          weekly_total_consumed = ?,
          weekly_total_target = ?,
          weekly_average = ?,
          on_pace_percentage = ?,
          trend = ?,
          updated_at = ?
        WHERE date = ?
      `);

      updateStmt.run(
        caloriesConsumed,
        caloriesTarget,
        calorieDeficitSurplus,
        goalMet ? 1 : 0,
        weeklyTotalConsumed,
        weeklyTotalTarget,
        weeklyAverage,
        onPacePercentage,
        trend,
        now,
        date
      );
    } else {
      const insertStmt = this.db.prepare(`
        INSERT INTO daily_calorie_tracking (
          id, date, profile_id, calories_consumed, calories_target,
          calories_deficit_surplus, goal_met, weekly_total_consumed,
          weekly_total_target, weekly_average, on_pace_percentage, trend,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        id,
        date,
        profileId,
        caloriesConsumed,
        caloriesTarget,
        calorieDeficitSurplus,
        goalMet ? 1 : 0,
        weeklyTotalConsumed,
        weeklyTotalTarget,
        weeklyAverage,
        onPacePercentage,
        trend,
        now,
        now
      );
    }

    // Update streak if today's entry changed
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      this.updateStreak(profileId, goalMet);
    }

    return this.getDailyTracking(profileId, date);
  }

  /**
   * Get daily tracking for a specific date
   */
  getDailyTracking(profileId: string, date: string): DailyCalorieTracking | null {
    const stmt = this.db.prepare(
      'SELECT * FROM daily_calorie_tracking WHERE date = ? AND profile_id = ?'
    );
    const row = stmt.get(date, profileId) as any;

    if (!row) return null;

    return this.rowToDailyTracking(row);
  }

  /**
   * Get weekly tracking data (7 days ending on endDate)
   */
  getWeeklyTracking(profileId: string, endDate: string): WeeklyProgressData {
    const weekData = this.getWeekForDate(endDate);
    const days: DailyCalorieTracking[] = [];

    let weeklyConsumed = 0;
    let weeklyTarget = 0;
    let daysMetGoal = 0;

    for (const day of weekData.days) {
      const tracking = this.getDailyTracking(profileId, day);
      if (tracking) {
        days.push(tracking);
        weeklyConsumed += tracking.caloriesConsumed;
        weeklyTarget += tracking.caloriesTarget;
        if (tracking.goalMet) daysMetGoal++;
      } else {
        // Create placeholder if no tracking exists
        days.push({
          id: uuidv4(),
          date: day,
          profileId,
          caloriesConsumed: 0,
          caloriesTarget: 0,
          calorieDeficitSurplus: 0,
          goalMet: false,
          onPacePercentage: 0,
          trend: 'stable',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const weeklyAverage = Math.round(weeklyConsumed / 7);
    const goal = this.goalRepo.getCurrentGoal(profileId);
    const weeklyTargetValue = goal
      ? goal.weeklyCalorieTarget + goal.dailyCalorieTarget * 7
      : weeklyTarget;
    const onPacePercentage = goal
      ? this.calculateOnPacePercentage(goal.goalType, weeklyConsumed, weeklyTargetValue, 7)
      : 0;

    // Calculate projection (what week total will be if trend continues for all 7 days)
    const daysWithData = days.filter((d) => d.caloriesConsumed > 0).length;
    const projection = daysWithData > 0 ? Math.round((weeklyConsumed / daysWithData) * 7) : 0;

    return {
      weekStart: weekData.days[0],
      days,
      weeklyAverage,
      weeklyTarget: weeklyTargetValue,
      weeklyConsumed,
      onPacePercentage,
      daysMetGoal,
      projection,
    };
  }

  /**
   * Get current streak information
   */
  getCurrentStreak(profileId: string): CalorieStreak | null {
    const stmt = this.db.prepare(`
      SELECT * FROM calorie_streaks
      WHERE profile_id = ? AND streak_end_date IS NULL
      ORDER BY streak_start_date DESC
      LIMIT 1
    `);

    const row = stmt.get(profileId) as any;
    if (!row) return null;

    return this.rowToStreak(row);
  }

  /**
   * Get best streak for a profile
   */
  getBestStreak(profileId: string): number {
    const stmt = this.db.prepare(`
      SELECT MAX(days_count) as best FROM calorie_streaks WHERE profile_id = ?
    `);

    const row = stmt.get(profileId) as any;
    return row?.best || 0;
  }

  /**
   * Get monthly tracking data with week-by-week breakdown
   */
  getMonthlyTracking(profileId: string, year: number, month: number): MonthlyCalorieData {
    // Get first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Get all days in the month
    const monthDays: string[] = [];
    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      monthDays.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group days into weeks
    const weeks: WeeklyMetrics[] = [];
    let currentWeek: string[] = [];
    let currentWeekStart: string | null = null;

    for (const day of monthDays) {
      const dayOfWeek = new Date(day).getDay();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        // End of week (Saturday -> Sunday)
        weeks.push(this.buildWeeklyMetrics(profileId, currentWeekStart!, currentWeek));
        currentWeek = [];
        currentWeekStart = null;
      }

      if (currentWeekStart === null) {
        currentWeekStart = day;
      }
      currentWeek.push(day);
    }

    // Don't forget the last partial week
    if (currentWeek.length > 0 && currentWeekStart) {
      weeks.push(this.buildWeeklyMetrics(profileId, currentWeekStart, currentWeek));
    }

    // Aggregate all weeks
    let monthlyConsumed = 0;
    let monthlyTarget = 0;
    let daysMetGoal = 0;
    const allDayTracking: DailyCalorieTracking[] = [];

    for (const week of weeks) {
      monthlyConsumed += week.weeklyConsumed;
      monthlyTarget += week.weeklyTarget;
      daysMetGoal += week.daysMetGoal;
      allDayTracking.push(...week.days);
    }

    const daysTotal = monthDays.length;
    const averageConsumed = daysTotal > 0 ? Math.round(monthlyConsumed / daysTotal) : 0;

    // Calculate overall trend
    const trend = this.calculateMonthlyTrend(allDayTracking);

    // Calculate on-pace percentage
    const goal = this.goalRepo.getCurrentGoal(profileId);
    const onPacePercentage = goal
      ? this.calculateOnPacePercentage(
          goal.goalType,
          monthlyConsumed,
          monthlyTarget * daysTotal,
          daysTotal
        )
      : 0;

    return {
      year,
      month,
      weeks,
      monthlyConsumed,
      monthlyTarget: monthlyTarget * daysTotal,
      monthlyDeficitSurplus: monthlyConsumed - monthlyTarget * daysTotal,
      daysMetGoal,
      daysTotal,
      averageConsumed,
      trend,
      onPacePercentage,
    };
  }

  /**
   * Get streak information with percentage calculation
   */
  getStreakInfo(profileId: string): StreakInfo {
    const currentStreak = this.getCurrentStreak(profileId);
    const bestStreak = this.getBestStreak(profileId);

    if (!currentStreak) {
      return {
        currentStreak: 0,
        bestStreak,
        isActive: false,
        streakStartDate: '',
        lastActivityDate: '',
        streakPercentage: 0,
      };
    }

    // Calculate streak percentage (days met goal / total days in streak)
    const streakPercentage =
      currentStreak.daysCount > 0
        ? Math.round((currentStreak.goalMetCount / currentStreak.daysCount) * 100)
        : 0;

    // Calculate last activity date (today or yesterday if streak ended)
    const lastActivityDate = currentStreak.streakEndDate || new Date().toISOString().split('T')[0];

    return {
      currentStreak: currentStreak.daysCount,
      bestStreak,
      isActive: currentStreak.isActive,
      streakStartDate: currentStreak.streakStartDate,
      lastActivityDate,
      streakPercentage,
    };
  }

  /**
   * Build weekly metrics for a given set of days
   */
  private buildWeeklyMetrics(profileId: string, weekStart: string, days: string[]): WeeklyMetrics {
    let weeklyConsumed = 0;
    let weeklyTarget = 0;
    let daysMetGoal = 0;
    const dayTrackings: DailyCalorieTracking[] = [];

    for (const day of days) {
      const tracking = this.getDailyTracking(profileId, day);
      if (tracking) {
        dayTrackings.push(tracking);
        weeklyConsumed += tracking.caloriesConsumed;
        weeklyTarget += tracking.caloriesTarget;
        if (tracking.goalMet) daysMetGoal++;
      }
    }

    const daysTotal = days.length;
    const averageConsumed = daysTotal > 0 ? Math.round(weeklyConsumed / daysTotal) : 0;
    const weeklyDeficitSurplus = weeklyConsumed - weeklyTarget;

    // Calculate trend for the week
    const trend = dayTrackings.length > 0 ? this.calculateTrendFromDays(dayTrackings) : 'stable';

    // Calculate on-pace percentage
    const goal = this.goalRepo.getCurrentGoal(profileId);
    const onPacePercentage = goal
      ? this.calculateOnPacePercentage(goal.goalType, weeklyConsumed, weeklyTarget, daysTotal)
      : 0;

    // Calculate projection (if trend continues for full 7-day week)
    const projection =
      dayTrackings.length > 0 ? Math.round((weeklyConsumed / dayTrackings.length) * 7) : 0;

    const weekEnd = new Date(days[days.length - 1]);
    weekEnd.setDate(weekEnd.getDate() + (6 - (days.length - 1)));

    return {
      weekStart,
      weekEnd: weekEnd.toISOString().split('T')[0],
      days: dayTrackings,
      weeklyConsumed,
      weeklyTarget: weeklyTarget * 7,
      weeklyDeficitSurplus,
      daysMetGoal,
      daysTotal,
      averageConsumed,
      trend,
      projection,
      onPacePercentage,
    };
  }

  /**
   * Calculate monthly trend from all tracking data
   */
  private calculateMonthlyTrend(dayTrackings: DailyCalorieTracking[]): 'up' | 'down' | 'stable' {
    if (dayTrackings.length < 3) return 'stable';

    // Compare first third with last third
    const thirdLength = Math.ceil(dayTrackings.length / 3);
    const firstThird = dayTrackings.slice(0, thirdLength);
    const lastThird = dayTrackings.slice(-thirdLength);

    const firstThirdAvg =
      firstThird.reduce((sum, d) => sum + d.caloriesConsumed, 0) / firstThird.length;
    const lastThirdAvg =
      lastThird.reduce((sum, d) => sum + d.caloriesConsumed, 0) / lastThird.length;

    const diff = lastThirdAvg - firstThirdAvg;

    if (diff > 100) return 'up';
    if (diff < -100) return 'down';
    return 'stable';
  }

  /**
   * Calculate trend from array of day trackings
   */
  private calculateTrendFromDays(dayTrackings: DailyCalorieTracking[]): 'up' | 'down' | 'stable' {
    if (dayTrackings.length < 2) return 'stable';

    const firstDayCalories = dayTrackings[0].caloriesConsumed;
    const lastDayCalories = dayTrackings[dayTrackings.length - 1].caloriesConsumed;
    const diff = lastDayCalories - firstDayCalories;

    if (diff > 100) return 'up';
    if (diff < -100) return 'down';
    return 'stable';
  }

  /**
   * Calculate calories consumed from meals on a date
   */
  private calculateCaloriesFromMeals(meals: any[]): number {
    return meals.reduce((total, meal) => {
      const nutrition = meal.totalNutrition || {};
      return total + (nutrition.calories || 0);
    }, 0);
  }

  /**
   * Determine if goal was met based on goal type
   */
  private determineGoalMet(goalType: string, consumed: number, target: number): boolean {
    if (goalType === 'weight_loss') {
      return consumed <= target;
    } else if (goalType === 'gain') {
      return consumed >= target;
    } else {
      // Maintenance: within ±50 calories
      return Math.abs(consumed - target) <= 50;
    }
  }

  /**
   * Calculate on-pace percentage for the week
   */
  private calculateOnPacePercentage(
    goalType: string,
    weeklyConsumed: number,
    weeklyTarget: number,
    daysElapsed: number
  ): number {
    if (goalType === 'weight_loss') {
      // For weight loss, we want to be below target
      // on-pace: if staying below target
      const deficit = weeklyTarget - weeklyConsumed;
      const targetDeficit = (Math.abs(weeklyTarget) / 7) * daysElapsed;
      return Math.round((deficit / targetDeficit) * 100);
    } else if (goalType === 'gain') {
      // For weight gain, we want to be above target
      const surplus = weeklyConsumed - weeklyTarget;
      const targetSurplus = (weeklyTarget / 7) * daysElapsed;
      return Math.round((surplus / targetSurplus) * 100);
    } else {
      // Maintenance: how close to target
      const difference = Math.abs(weeklyConsumed - weeklyTarget);
      const allowedDifference = 50 * daysElapsed;
      return Math.max(0, Math.round((1 - difference / allowedDifference) * 100));
    }
  }

  /**
   * Calculate trend (up, down, stable) based on last 3 days
   */
  private calculateTrend(
    profileId: string,
    date: string,
    currentCalories: number
  ): 'up' | 'down' | 'stable' {
    const dateObj = new Date(date);
    const prev1 = new Date(dateObj);
    prev1.setDate(prev1.getDate() - 1);
    const prev2 = new Date(dateObj);
    prev2.setDate(prev2.getDate() - 2);

    const prev1Str = prev1.toISOString().split('T')[0];
    const prev2Str = prev2.toISOString().split('T')[0];

    const prev1Tracking = this.getDailyTracking(profileId, prev1Str);
    const prev2Tracking = this.getDailyTracking(profileId, prev2Str);

    if (!prev1Tracking || !prev2Tracking) return 'stable';

    const avg = (prev1Tracking.caloriesConsumed + prev2Tracking.caloriesConsumed) / 2;
    const diff = currentCalories - avg;

    if (diff > 100) return 'up';
    if (diff < -100) return 'down';
    return 'stable';
  }

  /**
   * Update streak when goal is met/missed
   */
  private updateStreak(profileId: string, goalMet: boolean): void {
    const currentStreak = this.getCurrentStreak(profileId);

    if (goalMet) {
      if (currentStreak && currentStreak.isActive) {
        // Increment existing streak
        const stmt = this.db.prepare(`
          UPDATE calorie_streaks SET
            days_count = days_count + 1,
            goal_met_count = goal_met_count + 1
          WHERE id = ?
        `);
        stmt.run(currentStreak.id);
      } else {
        // Start new streak
        const id = uuidv4();
        const today = new Date().toISOString().split('T')[0];
        const stmt = this.db.prepare(`
          INSERT INTO calorie_streaks (
            id, profile_id, streak_start_date, days_count, goal_met_count, best_streak, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, profileId, today, 1, 1, 1, new Date().toISOString());
      }
    } else {
      // Goal not met - end current streak
      if (currentStreak && currentStreak.isActive) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const stmt = this.db.prepare(`
          UPDATE calorie_streaks SET
            streak_end_date = ?
          WHERE id = ?
        `);
        stmt.run(yesterdayStr, currentStreak.id);
      }
    }
  }

  /**
   * Get array of dates for the week (Sunday to Saturday) ending on the given date
   */
  private getWeekForDate(date: string): { days: string[] } {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const startOfWeek = new Date(dateObj);
    startOfWeek.setDate(dateObj.getDate() - dayOfWeek);

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day.toISOString().split('T')[0]);
    }

    return { days };
  }

  /**
   * Get index of a date within the week (0-6, where 0 = Sunday)
   */
  private getDayIndexInWeek(date: string): number {
    const dateObj = new Date(date);
    return dateObj.getDay();
  }

  /**
   * Convert database row to DailyCalorieTracking object
   */
  private rowToDailyTracking(row: any): DailyCalorieTracking {
    return {
      id: row.id,
      date: row.date,
      profileId: row.profile_id,
      caloriesConsumed: row.calories_consumed,
      caloriesTarget: row.calories_target,
      calorieDeficitSurplus: row.calories_deficit_surplus,
      goalMet: row.goal_met === 1,
      weeklyTotalConsumed: row.weekly_total_consumed,
      weeklyTotalTarget: row.weekly_total_target,
      weeklyAverage: row.weekly_average,
      onPacePercentage: row.on_pace_percentage,
      trend: row.trend,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert database row to CalorieStreak object
   */
  private rowToStreak(row: any): CalorieStreak {
    return {
      id: row.id,
      profileId: row.profile_id,
      streakStartDate: row.streak_start_date,
      streakEndDate: row.streak_end_date,
      daysCount: row.days_count,
      goalMetCount: row.goal_met_count,
      bestStreak: row.best_streak,
      createdAt: row.created_at,
      isActive: !row.streak_end_date,
    };
  }

  /**
   * Get all daily calorie tracking records for a profile
   */
  getAllDailyTracking(
    profileId: string,
    startDate?: string,
    endDate?: string
  ): DailyCalorieTracking[] {
    let query = 'SELECT * FROM daily_calorie_tracking WHERE profile_id = ?';
    const params: any[] = [profileId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => this.rowToDailyTracking(row));
  }

  /**
   * Get all calorie streaks for a profile
   */
  getAllStreaks(profileId: string): CalorieStreak[] {
    const stmt = this.db.prepare(
      'SELECT * FROM calorie_streaks WHERE profile_id = ? ORDER BY streak_start_date DESC'
    );
    const rows = stmt.all(profileId) as any[];

    return rows.map((row) => this.rowToStreak(row));
  }
}
