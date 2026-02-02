import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/connection';

export async function POST() {
  try {
    const db = getDatabase();

    // Disable foreign key constraints for clean wipe
    db.prepare('PRAGMA foreign_keys = OFF').run();

    // Delete all meal logs
    db.prepare('DELETE FROM meal_logs').run();

    // Delete all supplement logs
    db.prepare('DELETE FROM supplement_logs').run();

    // Delete all daily tracking
    db.prepare('DELETE FROM daily_calorie_tracking').run();

    // Delete all calorie goals
    db.prepare('DELETE FROM calorie_goals').run();

    // Delete all calorie streaks
    db.prepare('DELETE FROM calorie_streaks').run();

    // Delete all weight logs
    db.prepare('DELETE FROM weight_logs').run();

    // Delete all daily summaries
    db.prepare('DELETE FROM daily_summary').run();

    // Delete old profile-related tables (these should no longer be used)
    db.prepare('DELETE FROM user_conditions').run();
    db.prepare('DELETE FROM user_allergies').run();
    db.prepare('DELETE FROM profile').run();

    // Re-enable foreign key constraints
    db.prepare('PRAGMA foreign_keys = ON').run();

    return NextResponse.json({
      success: true,
      message: 'All data has been wiped successfully. Profile data now stored in JSON file.',
    });
  } catch (error: any) {
    console.error('Wipe Data Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to wipe data' }, { status: 500 });
  }
}
