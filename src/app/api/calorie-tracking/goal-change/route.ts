import { NextResponse } from 'next/server';
import { CalorieGoalRepository } from '@/lib/database/repositories/calorieGoalRepository';
import type { GoalChangeRequest, GoalChangeResponse } from '@/lib/types/calorieTracking';

export async function POST(request: Request) {
  try {
    const { weeklyCalorieTarget, reason } = (await request.json()) as GoalChangeRequest;

    if (typeof weeklyCalorieTarget !== 'number') {
      return NextResponse.json(
        { error: 'weeklyCalorieTarget is required and must be a number' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'reason is required and must be a string' },
        { status: 400 }
      );
    }

    if (weeklyCalorieTarget < -7000 || weeklyCalorieTarget > 7000) {
      return NextResponse.json(
        { error: 'weeklyCalorieTarget must be between -7000 and +7000' },
        { status: 400 }
      );
    }

    const calorieGoalRepo = new CalorieGoalRepository();

    // For now, we'll use a hardcoded profileId - in production this would come from session/auth
    // TODO: Get profileId from user session when auth is implemented
    const profileId = 'default-profile';

    // Check if there's an active streak
    const hasActiveStreak = calorieGoalRepo.hasActiveStreak(profileId);

    // Get current goal to preserve activity level and goal type
    const currentGoal = calorieGoalRepo.getCurrentGoal(profileId);
    if (!currentGoal) {
      return NextResponse.json(
        { error: 'No active goal found. Please create a goal first.' },
        { status: 400 }
      );
    }

    // Update the goal (archives old, creates new forward-only)
    const newGoal = calorieGoalRepo.updateGoal(
      profileId,
      currentGoal.goalType,
      weeklyCalorieTarget,
      currentGoal.activityLevel,
      reason
    );

    const response: GoalChangeResponse = {
      success: true,
      newGoal,
      streakResetRequired: hasActiveStreak,
      message: `Goal updated successfully. ${
        hasActiveStreak ? 'Your current streak will be reset if you confirm.' : 'No active streak to reset.'
      }`,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Goal change API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update goal' },
      { status: 500 }
    );
  }
}
