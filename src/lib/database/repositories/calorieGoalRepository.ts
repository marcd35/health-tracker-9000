import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import type {
  CalorieGoal,
  CalorieGoalHistory,
  GoalType,
  ActivityLevel,
} from '@/lib/types/calorieTracking';
import { calculateTDEE } from '@/lib/utils/nutritionalCalculator';
import { ProfileRepository } from './profileRepository';

export class CalorieGoalRepository {
  private db = getDatabase();
  private profileRepo = new ProfileRepository();

  /**
   * Create a new calorie goal
   */
  createGoal(
    profileId: string,
    goalType: GoalType,
    weeklyCalorieTarget: number,
    activityLevel: ActivityLevel
  ): CalorieGoal {
    const profile = this.profileRepo.getProfile();
    if (!profile) throw new Error('Profile not found');

    const id = uuidv4();
    const now = new Date().toISOString();

    // Calculate daily calorie target: TDEE adjusted by weekly target
    const tdee = calculateTDEE(profile);
    const dailyCalorieTarget = Math.round(tdee + weeklyCalorieTarget / 7);

    const goal: CalorieGoal = {
      id,
      profileId,
      goalType,
      weeklyCalorieTarget,
      dailyCalorieTarget,
      activityLevel,
      startDate: now.split('T')[0],
      endDate: null,
      createdAt: now,
      updatedAt: now,
    };

    // Archive any existing current goal
    this.archiveCurrentGoal(profileId);

    // Insert new goal
    const stmt = this.db.prepare(`
      INSERT INTO calorie_goals (
        id, profile_id, goal_type, weekly_calorie_target,
        daily_calorie_target, activity_level, start_date, end_date, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      goal.id,
      goal.profileId,
      goal.goalType,
      goal.weeklyCalorieTarget,
      goal.dailyCalorieTarget,
      goal.activityLevel,
      goal.startDate,
      goal.endDate,
      goal.createdAt,
      goal.updatedAt
    );

    // Record in history
    this.recordGoalChange(profileId, goal.id, 'created', null, goal.dailyCalorieTarget);

    return goal;
  }

  /**
   * Get the current active goal
   */
  getCurrentGoal(profileId: string): CalorieGoal | null {
    const stmt = this.db.prepare(`
      SELECT * FROM calorie_goals
      WHERE profile_id = ? AND end_date IS NULL
      ORDER BY start_date DESC
      LIMIT 1
    `);

    const row = stmt.get(profileId) as any;
    if (!row) return null;

    return this.rowToGoal(row);
  }

  /**
   * Update an existing goal (Phase 3: creates new goal, archives old one - forward-only)
   * This ensures goal changes apply only to future dates without recalculating past tracking
   */
  updateGoal(
    profileId: string,
    goalType: GoalType,
    weeklyCalorieTarget: number,
    activityLevel: ActivityLevel,
    changeReason?: string
  ): CalorieGoal {
    const currentGoal = this.getCurrentGoal(profileId);
    if (!currentGoal) throw new Error('No current goal found');

    const profile = this.profileRepo.getProfile();
    if (!profile) throw new Error('Profile not found');

    // Archive the current goal (end it today)
    const today = new Date().toISOString().split('T')[0];
    const archiveStmt = this.db.prepare(`
      UPDATE calorie_goals SET end_date = ? WHERE id = ?
    `);
    archiveStmt.run(today, currentGoal.id);

    // Record the archival in history
    this.recordGoalChange(
      profileId,
      currentGoal.id,
      'archived',
      currentGoal.dailyCalorieTarget,
      null,
      changeReason
    );

    // Create a new goal with the updated parameters (starting tomorrow)
    const newGoalId = uuidv4();
    const tdee = calculateTDEE(profile);
    const dailyCalorieTarget = Math.round(tdee + weeklyCalorieTarget / 7);
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // tomorrow

    const newGoal: CalorieGoal = {
      id: newGoalId,
      profileId,
      goalType,
      weeklyCalorieTarget,
      dailyCalorieTarget,
      activityLevel,
      startDate: tomorrow,
      endDate: null,
      createdAt: now,
      updatedAt: now,
    };

    // Insert new goal
    const insertStmt = this.db.prepare(`
      INSERT INTO calorie_goals (
        id, profile_id, goal_type, weekly_calorie_target,
        daily_calorie_target, activity_level, start_date, end_date, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      newGoal.id,
      newGoal.profileId,
      newGoal.goalType,
      newGoal.weeklyCalorieTarget,
      newGoal.dailyCalorieTarget,
      newGoal.activityLevel,
      newGoal.startDate,
      newGoal.endDate,
      newGoal.createdAt,
      newGoal.updatedAt
    );

    // Record the new goal creation in history
    this.recordGoalChange(profileId, newGoalId, 'created', null, dailyCalorieTarget, changeReason);

    return newGoal;
  }

  /**
   * Check if there's an active streak that would be affected by goal change
   */
  hasActiveStreak(profileId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT * FROM calorie_streaks
      WHERE profile_id = ? AND is_active = 1
      LIMIT 1
    `);

    const row = stmt.get(profileId) as any;
    return !!row;
  }

  /**
   * Archive the current goal (mark as ended)
   */
  archiveCurrentGoal(profileId: string): void {
    const currentGoal = this.getCurrentGoal(profileId);
    if (currentGoal) {
      const now = new Date().toISOString().split('T')[0];
      const stmt = this.db.prepare(`
        UPDATE calorie_goals SET end_date = ? WHERE id = ?
      `);
      stmt.run(now, currentGoal.id);

      this.recordGoalChange(
        profileId,
        currentGoal.id,
        'archived',
        currentGoal.dailyCalorieTarget,
        null
      );
    }
  }

  /**
   * Get goal history for a profile
   */
  getGoalHistory(profileId: string, limit: number = 50): CalorieGoalHistory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM calorie_goal_history
      WHERE profile_id = ?
      ORDER BY changed_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(profileId, limit) as any[];
    return rows.map(this.rowToGoalHistory);
  }

  /**
   * Record a goal change in history
   */
  private recordGoalChange(
    profileId: string,
    goalId: string,
    action: 'created' | 'updated' | 'archived',
    previousTarget: number | null,
    newTarget: number | null,
    reason?: string
  ): void {
    const historyId = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO calorie_goal_history (
        id, profile_id, calorie_goal_id, action,
        previous_daily_target, new_daily_target, change_reason, changed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(historyId, profileId, goalId, action, previousTarget, newTarget, reason || null, now);
  }

  /**
   * Convert database row to CalorieGoal object
   */
  private rowToGoal(row: any): CalorieGoal {
    return {
      id: row.id,
      profileId: row.profile_id,
      goalType: row.goal_type,
      weeklyCalorieTarget: row.weekly_calorie_target,
      dailyCalorieTarget: row.daily_calorie_target,
      activityLevel: row.activity_level,
      startDate: row.start_date,
      endDate: row.end_date,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert database row to CalorieGoalHistory object
   */
  private rowToGoalHistory(row: any): CalorieGoalHistory {
    return {
      id: row.id,
      profileId: row.profile_id,
      calorieGoalId: row.calorie_goal_id,
      action: row.action,
      previousDailyTarget: row.previous_daily_target,
      newDailyTarget: row.new_daily_target,
      changeReason: row.change_reason,
      changedAt: row.changed_at,
    };
  }

  /**
   * Get all calorie goals for a profile (including archived)
   */
  getAllGoals(profileId: string): CalorieGoal[] {
    const stmt = this.db.prepare(
      'SELECT * FROM calorie_goals WHERE profile_id = ? ORDER BY start_date DESC'
    );
    const rows = stmt.all(profileId) as any[];

    return rows.map((row) => this.rowToGoal(row));
  }

  /**
   * Get all calorie goal history records for a profile
   */
  getAllGoalHistory(profileId: string): CalorieGoalHistory[] {
    const stmt = this.db.prepare(
      'SELECT * FROM calorie_goal_history WHERE profile_id = ? ORDER BY changed_at DESC'
    );
    const rows = stmt.all(profileId) as any[];

    return rows.map((row) => this.rowToGoalHistory(row));
  }
}
