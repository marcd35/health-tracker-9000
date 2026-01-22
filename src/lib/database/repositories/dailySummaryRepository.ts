import { getDatabase } from '../connection';
import type { DailyLog, NutritionalValues } from '@/lib/types/health';
import type { DailySummaryRow } from '@/lib/types/database';
import { MealLogRepository } from './mealLogRepository';
import { SupplementRepository } from './supplementRepository';
import { ProfileRepository } from './profileRepository';
import { PreferencesRepository } from './preferencesRepository';
import { calculateHealthScore } from '@/lib/utils/healthScoring';

export class DailySummaryRepository {
  private db = getDatabase();
  private mealRepo = new MealLogRepository();
  private supplementRepo = new SupplementRepository();
  private profileRepo = new ProfileRepository();

  async getDailySummary(date: string): Promise<DailyLog | null> {
    return this.getDailySummarySync(date);
  }

  calculateDailyTotals(meals: any[], supplementLogs: any[]): NutritionalValues {
    const totals: NutritionalValues = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    meals.forEach((meal) => {
      Object.keys(meal.totalNutrition).forEach((key) => {
        (totals as Record<string, number>)[key] =
          ((totals as Record<string, number>)[key] || 0) + (meal.totalNutrition[key] || 0);
      });
    });

    // Add supplements
    const allSupplements = this.supplementRepo.getAllSupplements();
    supplementLogs.forEach((log) => {
      if (log.taken) {
        const supp = allSupplements.find((s) => s.id === log.supplementId);
        if (supp && supp.nutrients) {
          Object.entries(supp.nutrients).forEach(([key, value]) => {
            if (value !== undefined) {
              (totals as Record<string, number>)[key] =
                ((totals as Record<string, number>)[key] || 0) + value;
            }
          });
        }
      }
    });

    return totals;
  }

  saveDailySummary(summary: Partial<DailyLog> & { date: string }): void {
    const existing = this.db
      .prepare('SELECT * FROM daily_summary WHERE date = ?')
      .get(summary.date) as DailySummaryRow | undefined;
    const totalNutrition =
      summary.totalNutrition !== undefined
        ? JSON.stringify(summary.totalNutrition)
        : existing
          ? existing.total_nutrition
          : JSON.stringify({});

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE daily_summary SET
          weight = ?,
          total_nutrition = ?,
          health_score = ?,
          notes = ?
        WHERE date = ?
      `);
      stmt.run(
        summary.weight !== undefined ? summary.weight : existing.weight,
        totalNutrition,
        summary.healthScore !== undefined ? summary.healthScore : existing.health_score,
        summary.notes !== undefined ? summary.notes : existing.notes,
        summary.date
      );
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO daily_summary (date, weight, total_nutrition, health_score, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        summary.date,
        summary.weight,
        totalNutrition,
        summary.healthScore || 0,
        summary.notes,
        new Date().toISOString()
      );
    }
  }

  getWeeklySummary(endDate: string): DailyLog[] {
    const end = new Date(endDate);
    const dates: string[] = [];

    // Generate the 7 dates for the week
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Single query to get all summaries for the week
    const placeholders = dates.map(() => '?').join(',');
    const stmt = this.db.prepare(`SELECT * FROM daily_summary WHERE date IN (${placeholders})`);
    const summaryRows = stmt.all(...dates) as DailySummaryRow[];

    // Batch fetch all meals and supplements for the week
    const meals = this.mealRepo.getMealLogsByDates(dates);
    const supplements = this.supplementRepo.getSupplementLogsByDates(dates);

    // Group meals and supplements by date
    const mealsByDate = new Map<string, any[]>();
    const supplementsByDate = new Map<string, any[]>();

    meals.forEach((meal) => {
      if (!mealsByDate.has(meal.date)) {
        mealsByDate.set(meal.date, []);
      }
      mealsByDate.get(meal.date)!.push(meal);
    });

    supplements.forEach((supplement) => {
      if (!supplementsByDate.has(supplement.date)) {
        supplementsByDate.set(supplement.date, []);
      }
      supplementsByDate.get(supplement.date)!.push(supplement);
    });

    // Build summaries for each date
    const summaries: DailyLog[] = [];
    const profile = this.profileRepo.getProfile();

    for (const dateStr of dates) {
      const summaryRow = summaryRows.find((row) => row.date === dateStr);
      const dateMeals = mealsByDate.get(dateStr) || [];
      const dateSupplements = supplementsByDate.get(dateStr) || [];

      const summary: DailyLog = {
        date: dateStr,
        weight: summaryRow ? (summaryRow.weight ?? undefined) : undefined,
        meals: dateMeals,
        supplements: dateSupplements,
        totalNutrition: summaryRow
          ? JSON.parse(summaryRow.total_nutrition)
          : this.calculateDailyTotals(dateMeals, dateSupplements),
        healthScore: summaryRow ? summaryRow.health_score : 0,
        notes: summaryRow ? (summaryRow.notes ?? '') : '',
      };

      if (profile) {
        const targets = this.profileRepo.calculateNutritionalTargets();
        const preferencesRepo = new PreferencesRepository();
        const preferences = preferencesRepo.getPreferences();
        const breakdown = calculateHealthScore(
          summary.totalNutrition,
          targets,
          summary,
          preferences?.hydrationEnabled || false
        );
        summary.healthScoreBreakdown = breakdown;
        summary.healthScore = breakdown.total;
      }

      summaries.push(summary);
    }

    return summaries;
  }

  private getDailySummarySync(date: string): DailyLog | null {
    const stmt = this.db.prepare('SELECT * FROM daily_summary WHERE date = ?');
    const row = stmt.get(date) as DailySummaryRow | undefined;

    const meals = this.mealRepo.getMealLogsByDate(date);
    const supplements = this.supplementRepo.getSupplementLogsByDate(date);

    // Return null if no stored summary and no meals/supplements
    if (!row && meals.length === 0 && supplements.length === 0) {
      return null;
    }

    const profile = this.profileRepo.getProfile();

    const summary: DailyLog = {
      date: row ? row.date : date,
      weight: row ? (row.weight ?? undefined) : profile?.weight,
      meals,
      supplements,
      totalNutrition: row
        ? JSON.parse(row.total_nutrition)
        : this.calculateDailyTotals(meals, supplements),
      healthScore: row ? row.health_score : 0,
      notes: row ? (row.notes ?? '') : '',
    };

    if (profile) {
      const targets = this.profileRepo.calculateNutritionalTargets();
      const preferencesRepo = new PreferencesRepository();
      const preferences = preferencesRepo.getPreferences();
      const breakdown = calculateHealthScore(
        summary.totalNutrition,
        targets,
        summary,
        preferences?.hydrationEnabled || false
      );
      summary.healthScoreBreakdown = breakdown;
      summary.healthScore = breakdown.total;
    }

    return summary;
  }

  getAllDailySummaries(
    startDate?: string,
    endDate?: string,
    limit: number = 100,
    offset: number = 0
  ): { data: DailyLog[]; total: number } {
    // First, get the total count
    let countQuery = 'SELECT COUNT(*) as total FROM daily_summary';
    const countParams: any[] = [];

    if (startDate || endDate) {
      const conditions: string[] = [];
      if (startDate) {
        conditions.push('date >= ?');
        countParams.push(startDate);
      }
      if (endDate) {
        conditions.push('date <= ?');
        countParams.push(endDate);
      }
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const countStmt = this.db.prepare(countQuery);
    const countResult = countStmt.get(...countParams) as { total: number };
    const total = countResult.total;

    // Then get the paginated data
    let query = 'SELECT * FROM daily_summary';
    const params: any[] = [];

    if (startDate || endDate) {
      const conditions: string[] = [];
      if (startDate) {
        conditions.push('date >= ?');
        params.push(startDate);
      }
      if (endDate) {
        conditions.push('date <= ?');
        params.push(endDate);
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as DailySummaryRow[];

    if (rows.length === 0) return { data: [], total };

    // Extract all dates from the result set
    const dates = rows.map((row) => row.date);

    // Batch fetch all meals and supplements for these dates
    const meals = this.mealRepo.getMealLogsByDates(dates);
    const supplements = this.supplementRepo.getSupplementLogsByDates(dates);

    // Group meals and supplements by date
    const mealsByDate = new Map<string, any[]>();
    const supplementsByDate = new Map<string, any[]>();

    meals.forEach((meal) => {
      if (!mealsByDate.has(meal.date)) {
        mealsByDate.set(meal.date, []);
      }
      mealsByDate.get(meal.date)!.push(meal);
    });

    supplements.forEach((supplement) => {
      if (!supplementsByDate.has(supplement.date)) {
        supplementsByDate.set(supplement.date, []);
      }
      supplementsByDate.get(supplement.date)!.push(supplement);
    });

    const data = rows.map((row) => {
      const dateMeals = mealsByDate.get(row.date) || [];
      const dateSupplements = supplementsByDate.get(row.date) || [];

      const summary: DailyLog = {
        date: row.date,
        weight: row.weight ?? undefined,
        meals: dateMeals,
        supplements: dateSupplements,
        totalNutrition: JSON.parse(row.total_nutrition || '{}'),
        healthScore: row.health_score || 0,
        notes: row.notes ?? '',
      };

      return summary;
    });

    return { data, total };
  }
}
