# Enhanced Profile Export Design

## Current Export Structure Analysis

The current export only includes:

- Profile data
- Goal data

## Required Comprehensive Structure

```json
{
  "export_metadata": {
    "timestamp": "2024-01-21T00:58:00Z",
    "version": "2.0",
    "export_type": "full_profile"
  },
  "user_data": {
    "profile": {},
    "allergies": [],
    "preferences": {}
  },
  "nutrition_data": {
    "meals": {
      "current_meals": [],
      "meal_history": []
    },
    "calories": {
      "current_calorie_data": {},
      "calorie_history": []
    }
  },
  "supplement_data": {
    "current_supplements": [],
    "supplement_history": [],
    "supplement_targets": {}
  },
  "health_data": {
    "health_scores": [],
    "trends": {}
  },
  "system_data": {
    "app_version": "",
    "database_version": ""
  }
}
```

## Data Sources Mapping

### 1. Profile Data

- **Source**: `/api/profile`
- **Fields**: age, gender, weight, height, activity_level

### 2. Allergy Data

- **Source**: Need to check if allergy API exists
- **Fields**: allergen names, severity levels

### 3. Meal Data

- **Sources**:
  - Current meals: `/api/meals`
  - Meal history: `/api/meals` (with date filtering)
- **Fields**: meal_id, date, meal_type, foods, nutrition_data

### 4. Calorie Data

- **Sources**:
  - Current: `/api/calorie-tracking/current`
  - History: `/api/calorie-tracking/history`
- **Fields**: date, calories_consumed, calories_target, goal_met

### 5. Supplement Data

- **Sources**:
  - Current supplements: `/api/supplements/logs`
  - Supplement history: `/api/supplements/logs` (with date filtering)
  - Targets: `/api/supplements/targets`
- **Fields**: supplement_id, name, dosage, date, nutrient_data

### 6. Health Data

- **Sources**:
  - Health scores: Need to check if endpoint exists
  - Trends: May need to derive from existing data

## Implementation Plan

1. **API Discovery**: Check what endpoints are available for each data type
2. **Data Fetching**: Implement comprehensive data fetching with error handling
3. **Structure Building**: Create the hierarchical JSON structure
4. **Export Function**: Enhance the export function with the new structure
5. **Testing**: Verify all data is properly exported

## API Endpoints to Investigate

- `/api/allergies` - For allergy information
- `/api/health-scores` - For health metrics
- `/api/meals` - For meal data
- `/api/supplements/logs` - For supplement logs
- `/api/supplements/targets` - For supplement targets

## Error Handling Strategy

- Handle missing endpoints gracefully
- Provide partial exports when some data is unavailable
- Log detailed errors for debugging
- Show user-friendly error messages
