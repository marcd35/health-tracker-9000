import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { setupTestDbWithData, teardownTestDb } from '../setup/test-db';

describe('ProfileRepository', () => {
  let db: any;
  let repo: ProfileRepository;

  beforeEach(() => {
    db = setupTestDbWithData();
    repo = new ProfileRepository();
    // Override the database connection for testing
    (repo as any).db = db;
  });

  afterEach(() => {
    if (db) {
      teardownTestDb(db);
    }
  });

  describe('getProfile', () => {
    it('should return null when no profile exists', () => {
      // Clear existing profile
      db.prepare('DELETE FROM profile').run();
      db.prepare('DELETE FROM user_conditions').run();
      db.prepare('DELETE FROM user_allergies').run();

      const result = repo.getProfile();
      expect(result).toBeNull();
    });

    it('should return complete profile with conditions and allergies', () => {
      const profile = repo.getProfile();
      expect(profile).not.toBeNull();
      expect(typeof profile?.id).toBe('string');
      expect(typeof profile?.age).toBe('number');
      expect(typeof profile?.weight).toBe('number');
      expect(typeof profile?.height).toBe('number');
      expect(['male', 'female', 'other']).toContain(profile?.gender);
      expect(['sedentary', 'light', 'moderate', 'active', 'very_active']).toContain(
        profile?.activityLevel
      );
      expect(Array.isArray(profile?.healthConditions)).toBe(true);
      expect(Array.isArray(profile?.allergies)).toBe(true);
    });

    it('should return profile with populated conditions and allergies', () => {
      const existingProfile = repo.getProfile();
      const profileId = existingProfile?.id;

      // Add some conditions and allergies first
      db.prepare(
        'INSERT INTO user_conditions (id, profile_id, name, created_at) VALUES (?, ?, ?, ?)'
      ).run('cond-1', profileId, 'diabetes', new Date().toISOString());
      db.prepare(
        'INSERT INTO user_allergies (id, profile_id, name, created_at) VALUES (?, ?, ?, ?)'
      ).run('allergy-1', profileId, 'peanuts', new Date().toISOString());

      const profile = repo.getProfile();
      expect(profile?.healthConditions).toEqual(['diabetes']);
      expect(profile?.allergies).toEqual(['peanuts']);
    });
  });

  describe('updateProfile', () => {
    it('should update basic profile fields', () => {
      const updates = {
        age: 35,
        weight: 75.5,
        height: 175,
        gender: 'female' as const,
        activityLevel: 'active' as const,
      };

      repo.updateProfile(updates);

      const updated = repo.getProfile();
      expect(updated?.age).toBe(35);
      expect(updated?.weight).toBe(75.5);
      expect(updated?.height).toBe(175);
      expect(updated?.gender).toBe('female');
      expect(updated?.activityLevel).toBe('active');
      expect(updated?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should update health conditions', () => {
      const updates = {
        healthConditions: ['diabetes', 'hypertension', 'gout'],
      };

      repo.updateProfile(updates);

      const updated = repo.getProfile();
      expect(updated?.healthConditions).toEqual(['diabetes', 'hypertension', 'gout']);

      // Verify in database
      const conditions = db.prepare('SELECT name FROM user_conditions ORDER BY name').all();
      expect(conditions.map((c: any) => c.name)).toEqual(['diabetes', 'gout', 'hypertension']);
    });

    it('should update allergies', () => {
      const updates = {
        allergies: ['peanuts', 'shellfish', 'dairy'],
      };

      repo.updateProfile(updates);

      const updated = repo.getProfile();
      expect(updated?.allergies).toEqual(['peanuts', 'shellfish', 'dairy']);

      // Verify in database
      const allergies = db.prepare('SELECT name FROM user_allergies ORDER BY name').all();
      expect(allergies.map((a: any) => a.name)).toEqual(['dairy', 'peanuts', 'shellfish']);
    });

    it('should handle partial updates', () => {
      const original = repo.getProfile();

      repo.updateProfile({ weight: 80 });

      const updated = repo.getProfile();
      expect(updated?.weight).toBe(80);
      expect(updated?.age).toBe(original?.age); // Unchanged
      expect(updated?.height).toBe(original?.height); // Unchanged
    });

    it('should clear conditions and allergies when updating with empty arrays', () => {
      // First add some conditions and allergies
      repo.updateProfile({
        healthConditions: ['diabetes'],
        allergies: ['peanuts'],
      });

      // Then clear them
      repo.updateProfile({
        healthConditions: [],
        allergies: [],
      });

      const updated = repo.getProfile();
      expect(updated?.healthConditions).toEqual([]);
      expect(updated?.allergies).toEqual([]);
    });

    it('should throw error when no profile exists', () => {
      // Clear existing profile
      db.prepare('DELETE FROM profile').run();

      expect(() => {
        repo.updateProfile({ weight: 80 });
      }).toThrow('Profile not found');
    });
  });

  describe('calculateNutritionalTargets', () => {
    it('should calculate targets for male profile', () => {
      // Update profile to known values
      repo.updateProfile({
        age: 30,
        weight: 80,
        height: 180,
        gender: 'male',
        activityLevel: 'moderate',
      });

      const targets = repo.calculateNutritionalTargets();

      // Verify all required nutrients are present
      expect(targets).toMatchObject({
        calories: expect.any(Number),
        protein: expect.any(Number),
        carbs: expect.any(Number),
        fat: expect.any(Number),
        fiber: expect.any(Number),
        vitaminA: expect.any(Number),
        vitaminC: expect.any(Number),
        vitaminD: expect.any(Number),
        calcium: expect.any(Number),
        iron: expect.any(Number),
      });

      // Verify reasonable ranges
      expect(targets.calories).toBeGreaterThan(2000);
      expect(targets.protein).toBeGreaterThan(50);
      expect(targets.carbs).toBeGreaterThan(200);
      expect(targets.fat).toBeGreaterThan(50);
    });

    it('should calculate targets for female profile', () => {
      repo.updateProfile({
        age: 25,
        weight: 60,
        height: 165,
        gender: 'female',
        activityLevel: 'light',
      });

      const targets = repo.calculateNutritionalTargets();

      expect(targets.calories).toBeGreaterThan(1500);
      expect(targets.calories).toBeLessThan(2500);
      expect(targets.protein).toBeGreaterThan(30);
    });

    it('should calculate different targets for different activity levels', () => {
      repo.updateProfile({
        age: 30,
        weight: 70,
        height: 170,
        gender: 'male',
        activityLevel: 'sedentary',
      });

      const sedentaryTargets = repo.calculateNutritionalTargets();

      repo.updateProfile({ activityLevel: 'very_active' });
      const activeTargets = repo.calculateNutritionalTargets();

      expect(activeTargets.calories).toBeGreaterThan(sedentaryTargets.calories);
    });

    it('should throw error when no profile exists', () => {
      // Clear existing profile
      db.prepare('DELETE FROM profile').run();

      expect(() => {
        repo.calculateNutritionalTargets();
      }).toThrow('Profile not found');
    });
  });
});
