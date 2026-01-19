# USDA FoodData Central Integration

This document describes the USDA FoodData Central API integration for Health Tracker 9000.

## Overview

The USDA integration allows users to search 100,000+ foods with comprehensive micronutrient data from the official USDA FoodData Central database. Foods are automatically cached locally when selected, maintaining offline capability while enriching the food database with accurate nutritional information.

## Features

- **Toggle Search Mode**: Switch between local database and USDA API with a single button click
- **Auto-Import**: USDA foods are automatically saved to local database when selected
- **Offline Capable**: Cached USDA foods work offline after first import
- **Micronutrient Data**: Complete vitamin and mineral information for accurate health tracking
- **Allergen Detection**: Basic allergen detection from USDA ingredients data
- **Rate Limit Handling**: User-friendly error messages when API limits are reached

## Setup

### 1. Get USDA API Key

Sign up for a free API key at: https://fdc.nal.usda.gov/api-key-signup.html

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
USDA_API_KEY=your_api_key_here
USDA_API_BASE_URL=https://api.nal.usda.gov/fdc/v1
```

**Note**: `.env.local` is gitignored - never commit your API key!

### 3. Restart Development Server

```bash
npm run dev
```

## Usage

### For Users

1. Navigate to the meal logging page
2. Click the food search input
3. Click the **Database icon button** next to the search to toggle USDA mode
4. Search for a food (e.g., "chicken breast")
5. Select a food from the results
6. The food is automatically imported and can be used immediately
7. Future searches will find this food in local results (cached)

### For Developers

#### Search USDA Foods

```typescript
import { useHealthStore } from '@/lib/store/healthStore';

const { searchUSDAFoods, usdaSearchLoading } = useHealthStore();

// Search
const foods = await searchUSDAFoods('salmon');
```

#### Import USDA Food

```typescript
import { useHealthStore } from '@/lib/store/healthStore';

const { importUSDAFood } = useHealthStore();

// Import
const importedFood = await importUSDAFood(food);
```

#### Direct API Usage

```typescript
import { USDAClient, USDAMapper } from '@/lib/services/usda';

// Search
const client = new USDAClient();
const results = await client.searchFoods('chicken', 20);

// Map to Food interface
const foods = results.map((item) => USDAMapper.toFood(item));
```

## Architecture

### Service Layer

- **`src/lib/services/usda/client.ts`** - HTTP client for USDA API
- **`src/lib/services/usda/mapper.ts`** - Transforms USDA data to Food interface
- **`src/lib/services/usda/types.ts`** - TypeScript types for USDA API
- **`src/lib/services/usda/constants.ts`** - Nutrient ID mappings

### API Routes

- **`/api/foods/usda-search`** - Search USDA foods
- **`/api/foods/import`** - Import USDA food to local database

### Database Schema

Foods table has two new columns:

- `source` - 'manual' | 'mock' | 'usda'
- `usda_fdc_id` - USDA FoodData Central ID (for reference)

### UI Components

- **`FoodSearchInput`** - Updated with USDA toggle button and search mode

## Data Flow

```
User toggles USDA mode
    ↓
User searches for "salmon"
    ↓
API calls USDA FDC API
    ↓
Results mapped to Food interface
    ↓
User selects a food
    ↓
Food auto-imported to local database (with source='usda')
    ↓
Future searches find food instantly in local results
```

## Rate Limiting

- **USDA API Limit**: 1,000 requests per hour per IP
- **Strategy**: No client-side tracking, rely on USDA's 429 responses
- **User Experience**: Show user-friendly error message on rate limit

## Nutrient Mapping

USDA uses numeric nutrient IDs. We map them to our interface:

| USDA ID                                 | Property | Nutrient Name    |
| --------------------------------------- | -------- | ---------------- |
| 1008                                    | calories | Energy (kcal)    |
| 1003                                    | protein  | Protein (g)      |
| 1005                                    | carbs    | Carbohydrate (g) |
| 1004                                    | fat      | Total lipid (g)  |
| 1079                                    | fiber    | Fiber (g)        |
| 1106                                    | vitaminA | Vitamin A (mcg)  |
| 1162                                    | vitaminC | Vitamin C (mg)   |
| ... (see constants.ts for full mapping) |

## Allergen Detection

USDA allergen data may be incomplete. We use keyword matching on ingredients:

- Milk: milk, dairy, lactose, whey, casein
- Eggs: egg, albumin, mayonnaise
- Fish: fish, anchovy, bass, cod, salmon, tuna
- Shellfish: crab, lobster, shrimp, clam, oyster
- Tree Nuts: almond, cashew, walnut, pecan
- Peanuts: peanut, groundnut
- Wheat: wheat, flour, gluten
- Soybeans: soy, soybean, tofu

**Important**: Always display warning that USDA allergen data may be incomplete.

## API Endpoints

### GET /api/foods/usda-search

Search USDA foods.

**Query Parameters:**

- `q` (required) - Search query
- `limit` (optional) - Results limit (default: 20, max: 50)

**Response:**

```json
{
  "foods": [...],
  "source": "usda",
  "count": 15,
  "query": "chicken"
}
```

**Error Responses:**

- 400 - Invalid parameters
- 429 - Rate limit exceeded
- 500 - Server error
- 504 - Request timeout

### POST /api/foods/import

Import USDA food to local database.

**Request Body:**

```json
{
  "food": {
    "id": "usda-171705",
    "name": "Chicken Breast (grilled)",
    "usdaFdcId": 171705,
    ...
  }
}
```

**Response:**

```json
{
  "food": {...},
  "cached": false,
  "message": "Food imported successfully"
}
```

## Troubleshooting

### "USDA API configuration error"

- Check that `USDA_API_KEY` is set in `.env.local`
- Verify the API key is valid at https://fdc.nal.usda.gov/

### "USDA API rate limit exceeded"

- Wait 1 hour for rate limit to reset
- Use cached foods from local database

### "USDA API request timed out"

- Check internet connection
- Retry the request (automatic retry with exponential backoff)

### Foods not showing micronutrients

- USDA foods should have micronutrient data
- Some foods may have incomplete data
- Check the USDA website for the specific food

## Future Enhancements

- Background enrichment of existing mock foods with USDA data
- Barcode scanner using USDA GTIN/UPC data
- Food comparison tool
- Batch import capability
- Offline mode indicator

## References

- USDA FoodData Central: https://fdc.nal.usda.gov/
- API Guide: https://fdc.nal.usda.gov/api-guide/
- API Documentation: https://fdc.nal.usda.gov/api-spec/fdc_api.html
- API Key Signup: https://fdc.nal.usda.gov/api-key-signup/

---

**Last Updated**: 2026-01-19
