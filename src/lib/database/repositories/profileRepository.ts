import { getDatabase } from '../connection';
import type { UserProfile, NutritionalTargets } from '@/lib/types/health';

export class ProfileRepository {
  private db = getDatabase();

  getProfile(): UserProfile | null {
    const stmt = this.db.prepare('SELECT * FROM profile LIMIT 1');
    const row = stmt.get() as any;

    if (!row) return null;

    return {
      id: row.id,
      age: row.age,
      weight: row.weight,
      height: row.height,
      gender: row.gender,
      activityLevel: row.activity_level,
      healthConditions: JSON.parse(row.health_conditions || '[]'),
      allergies: JSON.parse(row.allergies || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  updateProfile(profile: Partial<UserProfile>): void {
    const current = this.getProfile();
    if (!current) throw new Error('Profile not found');

    const updated = { ...current, ...profile, updatedAt: new Date().toISOString() };

    const stmt = this.db.prepare(`
      UPDATE profile SET 
        age = ?, 
        weight = ?, 
        height = ?, 
        gender = ?, 
        activity_level = ?, 
        health_conditions = ?, 
        allergies = ?, 
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.age,
      updated.weight,
      updated.height,
      updated.gender,
      updated.activityLevel,
      JSON.stringify(updated.healthConditions),
      JSON.stringify(updated.allergies),
      updated.updatedAt,
      updated.id
    );
  }

  // Basic implementation of Harris-Benedict equation for TDEE
  calculateNutritionalTargets(): NutritionalTargets {
    const profile = this.getProfile();
    if (!profile) throw new Error('Profile not found');

    // BMR Calculation
    let bmr = 0;
    if (profile.gender === 'male') {
      bmr = 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age;
    } else {
      bmr = 447.593 + 9.247 * profile.weight + 3.098 * profile.height - 4.33 * profile.age;
    }

    // Activity Multiplier
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = Math.round(bmr * multipliers[profile.activityLevel]);

    // Simple Macro Split (40/30/30)
    // Protein: 1.6g per kg of body weight
    const protein = Math.round(profile.weight * 1.6);
    const fat = Math.round((tdee * 0.25) / 9);
    const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4);

    return {
      calories: tdee,
      protein,
      carbs,
      fat,
      fiber: 30,
      vitaminA: 900,
      vitaminC: 90,
      vitaminD: 20,
      vitaminE: 15,
      vitaminK: 120,
      thiamin: 1.2,
      riboflavin: 1.3,
      niacin: 16,
      vitaminB6: 1.3,
      folate: 400,
      vitaminB12: 2.4,
      calcium: 1000,
      iron: 8,
      magnesium: 400,
      potassium: 4700,
      zinc: 11,
      selenium: 55,
    };
  }
}
