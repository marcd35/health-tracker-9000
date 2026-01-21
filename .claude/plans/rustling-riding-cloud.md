# USDA FoodData Central API Integration Plan

## Executive Summary

Add USDA FoodData Central API integration to enable searching 100,000+ foods with complete micronutrient data during meal logging. USDA foods will be automatically cached locally when selected, maintaining offline capability. Implementation adds ~850 lines of code across 6 new files and 5 modified files, with no breaking changes to existing functionality.

## Overview

Integrate the USDA FoodData Central (FDC) API to allow users to search and import foods with comprehensive nutritional data (including micronutrients) during meal logging, while maintaining the app's privacy-first, local-only architecture.

## Background

**Current State:**

- Food search uses local SQLite database with ~50 mock foods
- Mock data only includes macronutrients (calories, protein, carbs, fat, fiber)
- No micronutrient data (vitamins/minerals) despite schema support
- Fast, offline-capable, but limited food database

**USDA FoodData Central API:**

- Official API: https://fdc.nal.usda.gov/api-guide/
- Public domain data (CC0 1.0 Universal license)
- Comprehensive nutrient data (100+ nutrients per food)
- Rate limit: 1,000 requests/hour per IP
- Requires API key (free signup)

## Recommended Architecture

### Hybrid Approach: Local-First with USDA Enrichment

**Design Principles:**

1. **Preserve offline capability** - Cache all USDA data locally
2. **Fast local search** - Keep existing local search as primary
3. **Progressive enhancement** - Add USDA as secondary data source
4. **User control** - Let users choose to search USDA or local only
5. **Privacy-first** - All data stored locally, no cloud sync

**User Preference Decisions:**

- ✅ UI: Toggle button in existing search (simple, discoverable)
- ✅ Import: Auto-import USDA foods to local database when selected
- ✅ Rate Limiting: No special handling, show user-friendly error on 429 responses

### Data Flow

```
User searches for food
    ↓
[Local DB Search] → Results shown immediately (existing behavior)
    ↓
[USDA Search Toggle Button] → User clicks to query USDA API
    ↓
USDA results displayed
    ↓
User selects food → Auto-imported to local DB
    ↓
Future searches find cached USDA foods instantly in local results
```

## Implementation Plan

### Phase 1: USDA Service Layer

**New files to create:**

1. **`src/lib/services/usda/client.ts`** - USDA API HTTP client
   - API key management (env variable)
   - Retry logic with exponential backoff
   - Error handling (user-friendly messages for 429 rate limit errors)
   - Endpoints: `/v1/foods/search`, `/v1/food/{fdcId}`

2. **`src/lib/services/usda/mapper.ts`** - USDA → Food interface mapper
   - Transform USDA FDC response to our `Food` type
   - Extract nutrients from USDA nutrient array
   - Normalize to per-100g basis
   - Handle missing data gracefully
   - Map allergen data if available

3. **`src/lib/services/usda/types.ts`** - USDA API TypeScript types
   - `USDASearchResponse`, `USDAFoodItem`, `USDANutrient` interfaces
   - Based on FDC API spec

**Key implementation details:**

```typescript
// USDA API returns nutrients as array:
// { nutrient: { id: 1003, name: "Protein" }, amount: 31, unitName: "g" }

// We need to map to our NutritionalValues interface:
// { protein: 31, calories: 165, ... }

// Challenge: USDA uses nutrient IDs, we use names
// Solution: Create nutrient ID → property name mapping
```

### Phase 2: Database Schema Extensions

**Modify existing schema:**

1. Add `source` column to `foods` table

   ```sql
   ALTER TABLE foods ADD COLUMN source TEXT DEFAULT 'manual';
   -- Values: 'manual' | 'mock' | 'usda'
   ```

2. Add `usda_fdc_id` column for reference

   ```sql
   ALTER TABLE foods ADD COLUMN usda_fdc_id TEXT;
   ```

3. Add index for performance
   ```sql
   CREATE INDEX idx_foods_usda_fdc_id ON foods(usda_fdc_id);
   ```

**Benefits:**

- Track data source for transparency
- Link to USDA for updates
- Query cached USDA foods efficiently
- Maintain data provenance

### Phase 3: Repository Layer Updates

**File to modify:** `src/lib/database/repositories/foodRepository.ts`

**New methods to add:**

```typescript
class FoodRepository {
  // Existing methods preserved
  searchFoods(query: string): Food[];
  getFoodById(id: string): Food | null;
  checkAllergens(foodId: string, userAllergies: string[]): string[];

  // New USDA-related methods
  createFoodFromUSDA(usdaFood: USDAFoodItem): string;
  // Inserts USDA food into local DB, returns new ID

  getFoodByUSDAId(fdcId: string): Food | null;
  // Check if USDA food already cached

  searchFoodsBySource(query: string, source: 'manual' | 'mock' | 'usda'): Food[];
  // Filter search by source

  updateFoodFromUSDA(foodId: string, usdaFood: USDAFoodItem): void;
  // Refresh cached USDA data
}
```

### Phase 4: API Routes

**New route:** `src/app/api/foods/usda-search/route.ts`

```typescript
// GET /api/foods/usda-search?q=chicken&limit=20

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  // Query USDA API directly (caching happens on selection, per user preference)
  try {
    const usdaClient = new USDAClient();
    const usdaResults = await usdaClient.searchFoods(query, limit);

    // Map to our Food interface
    const foods = usdaResults.map((item) => USDAMapper.toFood(item));

    return NextResponse.json({ foods, source: 'usda' });
  } catch (error) {
    // Handle rate limit and other errors
    if (error.message.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'USDA API rate limit exceeded. Please try again in an hour.',
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to search USDA foods. Please try again.',
      },
      { status: 500 }
    );
  }
}
```

**New route:** `src/app/api/foods/import/route.ts`

```typescript
// POST /api/foods/import
// Body: { fdcId: string }

// Allows importing specific USDA food by FDC ID
// Useful for manual enrichment or batch imports
```

### Phase 5: UI Updates

**File to modify:** `src/components/forms/FoodSearchInput.tsx`

**Changes:**

1. Add "Search USDA" toggle button next to search input (user preference)
2. Add loading state for USDA API calls with spinner
3. Display source badge on results (shows "USDA" for imported foods)
4. Show micronutrient preview in tooltip/popover for USDA foods
5. Auto-import USDA foods to database when selected (user preference)
6. Show user-friendly error message if rate limit exceeded
7. Handle longer load times gracefully with loading skeleton

### Phase 6: Store Updates

**File to modify:** `src/lib/store/healthStore.ts`

**New actions:**

```typescript
interface HealthStore {
  // Existing actions...
  searchFoods: (query: string) => Promise<Food[]>;

  // New USDA actions
  searchUSDAFoods: (query: string) => Promise<Food[]>;
  importUSDAFood: (fdcId: string) => Promise<Food>;

  // UI state
  usdaSearchLoading: boolean;
  usdaSearchError: string | null;
}
```

### Phase 7: Environment Configuration

**File to modify:** `.env.local` (create if doesn't exist)

```env
USDA_API_KEY=your_api_key_here
USDA_API_BASE_URL=https://api.nal.usda.gov/fdc/v1
```

**File to update:** `.env.example`

Add USDA variables with instructions for obtaining API key.

## Critical Implementation Details

### Nutrient Mapping

USDA uses numeric nutrient IDs. We need a mapping table:

```typescript
const NUTRIENT_ID_MAP: Record<number, keyof NutritionalValues> = {
  1008: 'calories', // Energy (kcal)
  1003: 'protein', // Protein
  1005: 'carbs', // Carbohydrate
  1004: 'fat', // Total lipid (fat)
  1079: 'fiber', // Fiber
  1106: 'vitaminA', // Vitamin A (mcg)
  1162: 'vitaminC', // Vitamin C (mg)
  1114: 'vitaminD', // Vitamin D (mcg)
  1109: 'vitaminE', // Vitamin E (mg)
  1185: 'vitaminK', // Vitamin K (mcg)
  1165: 'thiamin', // Thiamin (B1)
  1166: 'riboflavin', // Riboflavin (B2)
  1167: 'niacin', // Niacin (B3)
  1175: 'vitaminB6', // Vitamin B6
  1177: 'folate', // Folate (B9)
  1178: 'vitaminB12', // Vitamin B12
  1087: 'calcium', // Calcium
  1089: 'iron', // Iron
  1090: 'magnesium', // Magnesium
  1092: 'potassium', // Potassium
  1095: 'zinc', // Zinc
  1103: 'selenium', // Selenium
};
```

### Rate Limiting Strategy

**User preference: No special client-side rate limiting**

Simple error handling approach:

```typescript
class USDAClient {
  async searchFoods(query: string): Promise<USDAFoodItem[]> {
    const response = await fetch(`${USDA_API_BASE_URL}/foods/search`, {
      headers: { 'X-Api-Key': USDA_API_KEY },
    });

    if (response.status === 429) {
      throw new Error('USDA API rate limit exceeded. Please try again in an hour.');
    }

    if (!response.ok) {
      throw new Error('Failed to search USDA foods');
    }

    return response.json();
  }
}
```

Benefits:

- Simpler implementation
- No state management needed
- USDA handles rate limiting
- Clear user feedback on 429 errors

### Allergen Handling

USDA FDC API may not have comprehensive allergen data. Strategy:

1. Check for allergen keywords in ingredients string
2. Fall back to empty array if no data
3. Display warning: "Allergen data from USDA may be incomplete. Verify before consuming."

### Data Normalization

USDA foods have various serving sizes. Always normalize to per-100g:

```typescript
function normalizeToPercentGram(nutrientAmount: number, servingSize: number): number {
  return (nutrientAmount / servingSize) * 100;
}
```

## Files to Create/Modify

### New Files (6):

1. `src/lib/services/usda/client.ts` - API client
2. `src/lib/services/usda/mapper.ts` - Data mapper
3. `src/lib/services/usda/types.ts` - TypeScript types
4. `src/lib/services/usda/constants.ts` - Nutrient ID mappings
5. `src/app/api/foods/usda-search/route.ts` - USDA search endpoint
6. `src/app/api/foods/import/route.ts` - Import endpoint (for future batch imports)

### Files to Modify (5):

1. `src/lib/database/repositories/foodRepository.ts` - Add USDA methods (createFoodFromUSDA, getFoodByUSDAId)
2. `src/lib/database/schema.sql` - Add source + usda_fdc_id columns
3. `src/components/forms/FoodSearchInput.tsx` - Add USDA toggle button, auto-import on selection
4. `src/lib/store/healthStore.ts` - Add searchUSDAFoods action
5. `.env.example` - Add USDA configuration

### Files to Create for Config:

1. `.env.local` - User's API key (gitignored)

## Testing Strategy

### Unit Tests:

- `src/__tests__/lib/services/usda/mapper.test.ts` - Test USDA → Food mapping
- `src/__tests__/lib/services/usda/client.test.ts` - Mock API responses
- `src/__tests__/lib/database/repositories/foodRepository.test.ts` - Test new methods

### Integration Tests:

- `src/__tests__/app/api/foods/usda-search.test.ts` - Test API endpoint
- Test rate limiting behavior
- Test caching behavior
- Test error handling (API down, invalid key, etc.)

### Manual Testing:

1. Search for "chicken breast" - verify results
2. Import USDA food - verify micronutrients appear
3. Log meal with USDA food - verify nutrition calculated correctly
4. Test offline - verify cached foods still searchable
5. Test allergen warnings with USDA foods
6. Verify health score updates with micronutrient data

## Verification Plan

### End-to-End Flow:

1. Start app and navigate to meal logging page
2. Search for food using local search - verify instant results
3. Click "Search USDA" button
4. Enter "salmon" and wait for results
5. Verify USDA results show micronutrient data preview
6. Select USDA food and specify amount (150g)
7. Verify no allergen warnings (or appropriate warnings if applicable)
8. Log meal
9. Navigate to dashboard - verify health score updated
10. Navigate to analytics - verify micronutrient progress appears
11. Search for "salmon" again locally - verify now appears in local results (cached)
12. Restart app offline - verify salmon still searchable

### Database Verification:

```sql
-- Check USDA foods were cached
SELECT id, name, source, usda_fdc_id FROM foods WHERE source = 'usda';

-- Check micronutrient data
SELECT id, name, nutrition_per_100g FROM foods WHERE source = 'usda' LIMIT 1;
-- Should see vitaminA, vitaminC, etc. in JSON
```

### API Verification:

```bash
# Test USDA search endpoint
curl "http://localhost:3000/api/foods/usda-search?q=chicken"

# Test import endpoint
curl -X POST http://localhost:3000/api/foods/import \
  -H "Content-Type: application/json" \
  -d '{"fdcId":"171705"}'
```

## Migration Strategy

No breaking changes required. Existing functionality preserved:

- Local search continues to work exactly as before
- USDA is additive feature
- No database migration needed for existing data
- Schema additions are backward compatible (default values provided)

Optional: Run enrichment script to add `source='mock'` to existing foods for clarity.

## Security Considerations

1. **API Key Protection:**
   - Store in environment variable
   - Never commit to git
   - Add to `.gitignore`: `.env.local`

2. **Input Validation:**
   - Sanitize search queries before sending to USDA
   - Validate USDA API responses before storing
   - Protect against SQL injection in new repository methods

3. **Rate Limiting:**
   - Handle 429 errors gracefully with user-friendly messages
   - No client-side tracking needed (per user preference)

4. **Data Validation:**
   - Validate nutrient values are reasonable (not negative, not absurdly high)
   - Handle missing data gracefully
   - Verify units match expectations

## Future Enhancements (Out of Scope)

1. **Background Food Enrichment:** Batch job to enrich existing mock foods with USDA data
2. **Food Editing:** Allow users to edit USDA foods if data seems incorrect
3. **Barcode Scanner:** Use USDA GTIN/UPC data for barcode lookup
4. **Favorite Foods:** Quick access to frequently used USDA foods
5. **Offline Mode Indicator:** Show users when USDA search unavailable
6. **Food Comparison:** Compare nutritional profiles of multiple USDA foods

## References

- USDA FoodData Central: https://fdc.nal.usda.gov/
- API Guide: https://fdc.nal.usda.gov/api-guide/
- API Documentation: https://fdc.nal.usda.gov/api-spec/fdc_api.html
- API Key Signup: https://fdc.nal.usda.gov/api-key-signup/

---

**Implementation Estimate:**

- Service layer: ~200 lines
- Repository updates: ~100 lines
- API routes: ~150 lines
- UI updates: ~100 lines
- Tests: ~300 lines
- **Total:** ~850 lines of new code

**Risk Assessment:** Low

- No breaking changes
- Additive feature
- Well-documented API
- Existing architecture supports it
