import { getDatabase } from '../connection';
import type { UserProfile, NutritionalTargets } from '@/lib/types/health';
import { calculateNutritionalTargets } from '@/lib/utils/nutritionalCalculator';

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

  calculateNutritionalTargets(): NutritionalTargets {
    const profile = this.getProfile();
    if (!profile) throw new Error('Profile not found');
    return calculateNutritionalTargets(profile);
  }
}
