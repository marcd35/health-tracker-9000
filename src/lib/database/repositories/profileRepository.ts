import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import type { UserProfile, NutritionalTargets } from '@/lib/types/health';
import { calculateNutritionalTargets } from '@/lib/utils/nutritionalCalculator';

export class ProfileRepository {
  private db = getDatabase();

  getProfile(): UserProfile | null {
    const stmt = this.db.prepare('SELECT * FROM profile LIMIT 1');
    const row = stmt.get() as any;

    if (!row) return null;

    const conditions = this.db
      .prepare('SELECT name FROM user_conditions WHERE profile_id = ?')
      .all(row.id) as { name: string }[];

    const allergies = this.db
      .prepare('SELECT name FROM user_allergies WHERE profile_id = ?')
      .all(row.id) as { name: string }[];

    return {
      id: row.id,
      age: row.age,
      weight: row.weight,
      height: row.height,
      gender: row.gender,
      activityLevel: row.activity_level,
      healthConditions: conditions.map((c) => c.name),
      allergies: allergies.map((a) => a.name),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  updateProfile(profile: Partial<UserProfile>): void {
    const current = this.getProfile();
    if (!current) throw new Error('Profile not found');

    const updated = { ...current, ...profile, updatedAt: new Date().toISOString() };

    const updateTx = this.db.transaction(() => {
      // Update main profile fields
      this.db
        .prepare(
          `
        UPDATE profile SET 
          age = ?, 
          weight = ?, 
          height = ?, 
          gender = ?, 
          activity_level = ?, 
          updated_at = ?
        WHERE id = ?
      `
        )
        .run(
          updated.age,
          updated.weight,
          updated.height,
          updated.gender,
          updated.activityLevel,
          updated.updatedAt,
          updated.id
        );

      // Update Health Conditions
      this.db.prepare('DELETE FROM user_conditions WHERE profile_id = ?').run(updated.id);
      const insertCondition = this.db.prepare(
        'INSERT INTO user_conditions (id, profile_id, name, created_at) VALUES (?, ?, ?, ?)'
      );
      updated.healthConditions.forEach((condition) => {
        insertCondition.run(uuidv4(), updated.id, condition, new Date().toISOString());
      });

      // Update Allergies
      this.db.prepare('DELETE FROM user_allergies WHERE profile_id = ?').run(updated.id);
      const insertAllergy = this.db.prepare(
        'INSERT INTO user_allergies (id, profile_id, name, created_at) VALUES (?, ?, ?, ?)'
      );
      updated.allergies.forEach((allergy) => {
        insertAllergy.run(uuidv4(), updated.id, allergy, new Date().toISOString());
      });
    });

    updateTx();
  }

  calculateNutritionalTargets(): NutritionalTargets {
    const profile = this.getProfile();
    if (!profile) throw new Error('Profile not found');
    return calculateNutritionalTargets(profile);
  }
}
