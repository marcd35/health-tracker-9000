import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MealLogForm } from '@/components/forms/MealLogForm';
import { useHealthStore } from '@/lib/store/healthStore';

// Mock dependencies
jest.mock('@/lib/store/healthStore');
jest.mock('@/components/forms/FoodSearchInput', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FoodSearchInput: ({ onSelect }: any) => (
    <button
      onClick={() => onSelect({ id: '1', name: 'Test Food', nutritionPer100g: { calories: 100 } })}
    >
      Select Test Food
    </button>
  ),
}));

describe('MealLogForm', () => {
  const mockAddMeal = jest.fn();
  const mockFetchProfile = jest.fn();
  const mockProfile = { id: 'user-1', allergies: [] };

  beforeEach(() => {
    (useHealthStore as unknown as jest.Mock).mockReturnValue({
      addMeal: mockAddMeal,
      fetchProfile: mockFetchProfile,
      profile: mockProfile,
      isLoading: false,
    });
    mockAddMeal.mockClear();
    mockFetchProfile.mockClear();
  });

  it('adds food to the list and submits', async () => {
    render(<MealLogForm />);

    // Select food
    fireEvent.click(screen.getByText('Select Test Food'));
    expect(screen.getByText('Test Food')).toBeInTheDocument();

    // Verify default amount is 100
    const amountInput = screen.getByDisplayValue('100');
    expect(amountInput).toBeInTheDocument();

    // Submit
    fireEvent.click(screen.getByText('Log Meal'));

    await waitFor(() => {
      expect(mockAddMeal).toHaveBeenCalledWith(
        expect.objectContaining({
          mealType: 'breakfast', // default
          foods: expect.arrayContaining([expect.objectContaining({ foodId: '1', amount: 100 })]),
        })
      );
    });
  });

  it('validates input before submitting', async () => {
    render(<MealLogForm />);

    // Select food
    fireEvent.click(screen.getByText('Select Test Food'));

    // Change amount to 0
    const amountInput = screen.getByDisplayValue('100');
    fireEvent.change(amountInput, { target: { value: '0' } });

    // Try to submit
    fireEvent.click(screen.getByText('Log Meal'));

    // Should show error and NOT call addMeal
    await waitFor(() => {
      expect(screen.getByText('Amount must be > 0')).toBeInTheDocument();
    });
    expect(mockAddMeal).not.toHaveBeenCalled();
  });
});
