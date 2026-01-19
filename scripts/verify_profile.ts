
import { ProfileRepository } from '../src/lib/database/repositories/profileRepository';
import { getDatabase } from '../src/lib/database/connection';

async function main() {
    console.log('Starting verification...');
    const repo = new ProfileRepository();
    const db = getDatabase();

    // 1. Get initial profile
    let profile = repo.getProfile();
    if (!profile) {
        console.log('No profile found. Creating a dummy one via SQL for testing...');
        db.prepare(`
          INSERT INTO profile (id, age, weight, height, gender, activity_level, created_at, updated_at)
          VALUES ('test-user', 30, 70, 175, 'male', 'moderate', datetime('now'), datetime('now'))
      `).run();
        profile = repo.getProfile();
    }

    if (!profile) throw new Error('Failed to get/create profile');
    console.log('Initial profile:', profile.id);

    // 2. Update with new conditions/allergies
    const newConditions = ['Gout', 'Asthma'];
    const newAllergies = ['Dairy', 'Peanuts'];

    console.log('Updating profile with new conditions and allergies...');
    repo.updateProfile({
        ...profile,
        healthConditions: newConditions,
        allergies: newAllergies
    });

    // 3. Verify via Repository
    const updatedProfile = repo.getProfile();
    console.log('Fetched updated profile.');

    if (JSON.stringify(updatedProfile?.healthConditions.sort()) !== JSON.stringify(newConditions.sort())) {
        throw new Error(`Conditions mismatch. Expected ${newConditions}, got ${updatedProfile?.healthConditions}`);
    }
    if (JSON.stringify(updatedProfile?.allergies.sort()) !== JSON.stringify(newAllergies.sort())) {
        throw new Error(`Allergies mismatch. Expected ${newAllergies}, got ${updatedProfile?.allergies}`);
    }
    console.log('Repository verification PASSED.');

    // 4. Verify via Direct SQL
    console.log('Verifying SQL tables directly...');
    const conditionsRows = db.prepare('SELECT name FROM user_conditions WHERE profile_id = ?').all(updatedProfile?.id);
    const allergiesRows = db.prepare('SELECT name FROM user_allergies WHERE profile_id = ?').all(updatedProfile?.id);

    console.log('SQL Conditions:', conditionsRows);
    console.log('SQL Allergies:', allergiesRows);

    if (conditionsRows.length !== 2) throw new Error('Expected 2 rows in user_conditions');
    if (allergiesRows.length !== 2) throw new Error('Expected 2 rows in user_allergies');

    console.log('ALL VERIFICATIONS PASSED.');
}

main().catch(console.error);
