import { render, screen } from '@testing-library/react';
import { CalorieProgressCard } from '@/components/dashboard/CalorieProgressCard';
import * as CalorieTrackerStore from '@/lib/store/calorieTrackerStore';

// Mock the store
jest.mock('@/lib/store/calorieTrackerStore', () => ({
  useCalorieTrackerStore: jest.fn(),
}));

describe('CalorieProgressCard', () => {
  const mockFetchCurrentGoal = jest.fn();
  const mockFetchDailyTracking = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Set Calorie Goal" button when no goal exists', () => {
    (CalorieTrackerStore.useCalorieTrackerStore as unknown as jest.Mock).mockReturnValue({
      currentGoal: null,
      todayTracking: null,
      fetchCurrentGoal: mockFetchCurrentGoal,
      fetchDailyTracking: mockFetchDailyTracking,
    });

    render(<CalorieProgressCard />);

    expect(screen.getByText('Set Calorie Goal')).toBeInTheDocument();
    expect(screen.getByText(/Set a calorie goal to track your daily progress/)).toBeInTheDocument();
  });

  it('renders progress when goal exists', () => {
    (CalorieTrackerStore.useCalorieTrackerStore as unknown as jest.Mock).mockReturnValue({
      currentGoal: {
        weeklyCalorieTarget: 14000, // 2000 per day
      },
      todayTracking: {
        consumed: 1800,
      },
      fetchCurrentGoal: mockFetchCurrentGoal,
      fetchDailyTracking: mockFetchDailyTracking,
    });

    render(<CalorieProgressCard />);

    expect(screen.getByText('1800')).toBeInTheDocument();
    expect(screen.getByText('/ 2000 cal')).toBeInTheDocument();
    expect(screen.getByText('On track')).toBeInTheDocument();
  });

  it('shows "over" status when consumed exceeds target', () => {
    (CalorieTrackerStore.useCalorieTrackerStore as unknown as jest.Mock).mockReturnValue({
      currentGoal: {
        weeklyCalorieTarget: 14000,
      },
      todayTracking: {
        consumed: 2300,
      },
      fetchCurrentGoal: mockFetchCurrentGoal,
      fetchDailyTracking: mockFetchDailyTracking,
    });

    render(<CalorieProgressCard />);

    expect(screen.getByText(/300 over/)).toBeInTheDocument();
  });

  it('shows "remaining" status when consumed is below target', () => {
    (CalorieTrackerStore.useCalorieTrackerStore as unknown as jest.Mock).mockReturnValue({
      currentGoal: {
        weeklyCalorieTarget: 14000,
      },
      todayTracking: {
        consumed: 1500,
      },
      fetchCurrentGoal: mockFetchCurrentGoal,
      fetchDailyTracking: mockFetchDailyTracking,
    });

    render(<CalorieProgressCard />);

    expect(screen.getByText(/500 remaining/)).toBeInTheDocument();
  });

  it('calculates and displays correct percentage', () => {
    (CalorieTrackerStore.useCalorieTrackerStore as unknown as jest.Mock).mockReturnValue({
      currentGoal: {
        weeklyCalorieTarget: 14000,
      },
      todayTracking: {
        consumed: 1000,
      },
      fetchCurrentGoal: mockFetchCurrentGoal,
      fetchDailyTracking: mockFetchDailyTracking,
    });

    render(<CalorieProgressCard />);

    // 1000 / 2000 = 50%
    expect(screen.getByText('50% of daily target')).toBeInTheDocument();
  });

  it('fetches data on mount', () => {
    (CalorieTrackerStore.useCalorieTrackerStore as unknown as jest.Mock).mockReturnValue({
      currentGoal: null,
      todayTracking: null,
      fetchCurrentGoal: mockFetchCurrentGoal,
      fetchDailyTracking: mockFetchDailyTracking,
    });

    render(<CalorieProgressCard />);

    expect(mockFetchCurrentGoal).toHaveBeenCalled();
    expect(mockFetchDailyTracking).toHaveBeenCalled();
  });

  it('handles zero consumption', () => {
    (CalorieTrackerStore.useCalorieTrackerStore as unknown as jest.Mock).mockReturnValue({
      currentGoal: {
        weeklyCalorieTarget: 14000,
      },
      todayTracking: {
        consumed: 0,
      },
      fetchCurrentGoal: mockFetchCurrentGoal,
      fetchDailyTracking: mockFetchDailyTracking,
    });

    render(<CalorieProgressCard />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/2000 remaining/)).toBeInTheDocument();
    expect(screen.getByText('0% of daily target')).toBeInTheDocument();
  });
});
