import { getDatabase } from '../connection';
import type { DailyLog, NutritionalValues } from '@/lib/types/health';
import { MealLogRepository } from './mealLogRepository';
import { SupplementRepository } from './supplementRepository';
import { ProfileRepository } from './profileRepository';
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
        totals[key] = (totals[key] || 0) + (meal.totalNutrition[key] || 0);
      });
    });

    // Add supplements
    const allSupplements = this.supplementRepo.getAllSupplements();
    supplementLogs.forEach((log) => {
      if (log.taken) {
        const supp = allSupplements.find((s) => s.id === log.supplementId);
        if (supp && supp.nutrients) {
          Object.entries(supp.nutrients).forEach(([key, value]) => {
            if (value !== undefined && key in totals) {
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
      .get(summary.date);
    const totalNutrition = JSON.stringify(summary.totalNutrition || {});

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
        summary.weight,
        totalNutrition,
        summary.healthScore || 0,
        summary.notes,
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
    const summaries: DailyLog[] = [];
    const end = new Date(endDate);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const s = this.getDailySummarySync(dateStr);
      if (s) summaries.push(s);
    }

    return summaries;
  }

  private getDailySummarySync(date: string): DailyLog | null {
    const stmt = this.db.prepare('SELECT * FROM daily_summary WHERE date = ?');
    const row = stmt.get(date) as any;

    const meals = this.mealRepo.getMealLogsByDate(date);
    const supplements = this.supplementRepo.getSupplementLogsByDate(date);
    const profile = this.profileRepo.getProfile();

    const summary: DailyLog = {
      date: row ? row.date : date,
      weight: row ? row.weight : profile?.weight,
      meals,
      supplements,
      totalNutrition: row
        ? JSON.parse(row.total_nutrition)
        : this.calculateDailyTotals(meals, supplements),
      healthScore: row ? row.health_score : 0,
      notes: row ? row.notes : '',
    };

    if (profile) {
      const targets = this.profileRepo.calculateNutritionalTargets();
      const breakdown = calculateHealthScore(summary.totalNutrition, targets, summary);
      summary.healthScoreBreakdown = breakdown;
      summary.healthScore = breakdown.total;
    }

    return summary;
  }
}
