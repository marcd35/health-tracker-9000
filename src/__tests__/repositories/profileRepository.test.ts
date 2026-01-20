import { ProfileRepository } from '@/lib/database/repositories/profileRepository';
import { getDatabase } from '@/lib/database/connection';
import { setupTestDb, seedTestProfile } from '../test-db';
import Database from 'better-sqlite3';

// Mock uuid
jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-uuid') }));

// Mock the database connection module
jest.mock('@/lib/database/connection', () => ({
  getDatabase: jest.fn(),
}));

describe('ProfileRepository', () => {
  let db: Database.Database;
  let repo: ProfileRepository;

  beforeEach(() => {
    // Setup in-memory database
    db = setupTestDb();

    // Configure mock to return our in-memory instance
    (getDatabase as jest.Mock).mockReturnValue(db);

    // Seed initial data
    seedTestProfile(db);

    // Initialize repository
    repo = new ProfileRepository();
  });

  afterEach(() => {
    db.close();
  });

  it('retrieves the profile', () => {
    const profile = repo.getProfile();
    expect(profile).not.toBeNull();
    expect(profile?.id).toBe('test-id');
    expect(profile?.gender).toBe('male');
  });

  it('updates the profile', () => {
    repo.updateProfile({ weight: 85, activityLevel: 'active' });

    const updated = repo.getProfile();
    expect(updated?.weight).toBe(85);
    expect(updated?.activityLevel).toBe('active');
    expect(updated?.height).toBe(180); // Should remain unchanged
  });

  it('calculates nutritional targets based on profile', () => {
    const targets = repo.calculateNutritionalTargets();
    // 80kg male moderate activity -> TDEE ~ 2873 (from unit tests)
    // Here we use 80kg from seed.
    expect(targets.protein).toBeGreaterThan(0);
    expect(targets.calories).toBeGreaterThan(0);
  });
});
