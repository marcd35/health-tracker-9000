# USDA Food Data Integration with Data Mapping & Inspection

"Build a food data inspection and mapping system for the meal logging page that allows users to review USDA API data before database insertion.

## Phase 1: Data Inspection Modal

1. **Add 'Inspect Data' Button**
   - Place next to the amount input in 'Log a Meal' section
   - Place next to delete icon in 'Today's Meals' section
   - Use consistent icon/styling across both locations

2. **Create Inspection Modal**
   - Display the complete raw JSON from USDA API response
   - Pretty-print JSON for readability
   - Make modal easy to close (X button, ESC key, click outside)
   - Include a note: **"⚠️ USDA does not provide allergen information. Always review ingredients and verify allergen status before logging."**

3. **Serving Size Selection**
   - If food has multiple `foodPortions` options, show a dropdown: 'Select serving size'
   - Default to first option for SR Legacy foods
   - For Branded foods, use single `servingSize` (no dropdown needed)
   - Display selected serving size clearly above JSON
   - Note: Nutritional values scale based on selection

## Phase 2: Data Extraction & Mapping Configuration

4. **Build Extraction Logic**
   - Extract ALL available nutrient data from USDA response (not just the 6 core fields)
   - Handle both data types:
     - **Branded foods:** Prioritize `labelNutrients` (simplified, per-serving)
     - **SR Legacy foods:** Use `foodNutrients` array (detailed breakdown)
   - Capture all available fields: `fdcId`, `description`, `ingredients`, `brandName`, `servingSize`, `servingSizeUnit`, `foodPortions`, all nutrient values
   - Store raw extraction in a temporary variable for modal display

5. **Create Database Migration (New)**
   - ✅ Create a new migration file to add missing columns to `foods` table:
     - `brand_name` (TEXT)
     - `ingredients` (TEXT)
     - `sugar` (REAL)
     - `calcium` (REAL)
     - `iron` (REAL)
     - `sodium` (REAL)
     - `potassium` (REAL)
     - `vitamin_a` (REAL)
     - `vitamin_c` (REAL)
     - `vitamin_d` (REAL)

6. **Create Data Mapping Configuration**
   - Build a mapping object that translates USDA field names to your database schema
   - Example structure:

   ```
   USDA_TO_DB_MAPPING = {
     'fdcId': 'usda_fdc_id',
     'description': 'name',
     // Nutrient IDs (preferred over names for stability)
     '208': 'calories',           // Energy
     '203': 'protein',            // Protein
     '205': 'carbs',              // Carbohydrate, by difference
     '204': 'fat',                // Total lipid (fat)
     '291': 'fiber',              // Fiber, total dietary
     // Fields requiring validation/migration:
     '269': 'sugar',              // Sugars, total
     '301': 'calcium',            // Calcium
     '303': 'iron',               // Iron
     '307': 'sodium',             // Sodium
     '306': 'potassium',          // Potassium
     '318': 'vitamin_a',          // Vitamin A
     '401': 'vitamin_c',          // Vitamin C
     '324': 'vitamin_d',          // Vitamin D
     // ... all other nutrients
     // ... all other nutrients
     'ingredients': 'ingredients',
     'servingSize': 'serving_size',
     'servingSizeUnit': 'serving_unit',
     'brandName': 'brand_name'
   }
   ```

   - Make this configurable (easy to update mapping rules if USDA field names change)

7. **Transform & Preview Data**
   - **Normalization Logic:** Ensure nutrient values are scaled to the selected `serving_size`. USDA data may come as per 100g or per serving. Transformation must calculate: `(Value / Base Amount) * Selected Serving Size`.
   - Take extracted USDA data and transform to match your database schema
   - Display a 'Preview' section in the modal showing:
     - Original USDA value
     - Mapped database field name
     - Transformed value
   - Highlight any unmapped or null fields in yellow/warning color
   - Example preview:

   ```
   USDA Field          → DB Column        → Transformed Value
   Energy (208)        → calories         → 143 kcal
   Protein (203)       → protein_g        → 14.29 g
   [unmapped field]    → [no mapping]     → ⚠️ Review needed
   ```

8. **Update Repository Layer**
   - Update `FoodRepository.ts` to support reading, searching, and writing the newly added columns:
     - `brand_name`, `ingredients`, `sugar`, `calcium`, `iron`, `sodium`, `potassium`, `vitamin_a`, `vitamin_c`, `vitamin_d`.
   - Ensure `getFoodById`, `searchFoods`, and `createFoodFromUSDA` methods populate/handle these fields.

## Phase 3: Allergen Detection (MVP)

9. **Allergen Keyword Parser**
   - Scan `ingredients` field for common allergen keywords:
     - Big 9: milk, eggs, peanuts, tree nuts, fish, shellfish, soy, wheat, sesame
     - Common additives: sulfites, dyes, MSG, artificial sweeteners
   - For each detected allergen, display a warning in the modal:
     - 'Detected allergen: [allergen]' (orange/warning styling)
     - Show the ingredient snippet where it was found
   - Include disclaimer: "This is keyword-based detection. Always verify actual allergen statements on packaging."

10. **Manual Allergen Flagging**

- Allow user to manually check/uncheck allergens in a checklist
- Store manually-flagged allergens separately from auto-detected ones
- These user flags will be saved to the `food_allergens` mapping table (Phase 4)

---

**Phase 4: Allergen Mapping Table (Future Expansion)**

**[PLACEHOLDER: Allergen Reference Integration]**

- Build a `food_allergens` lookup table in database with structure:
  ```
  food_id (FK to foods table)
  allergen_type (enum: milk, eggs, peanuts, tree_nuts, fish, shellfish, soy, wheat, sesame, other)
  source (enum: auto_detected, user_flagged, external_db)
  confidence_level (enum: high, medium, low)
  notes (string for edge cases)
  ```
- When user logs a food, check this table and pre-populate allergen warnings
- Allow users to contribute/correct allergen data over time

**[PLACEHOLDER: External Allergen Database Integration]**

- Future phase: Integrate with external allergen data sources (e.g., FatSecret API, Open Food Facts, or similar)
- When USDA data is retrieved, cross-reference with external database for additional allergen information
- Merge results and show unified allergen warnings
- Implementation: Consider async lookup to avoid blocking modal display

**[PLACEHOLDER: Edge Case & Unique Foods Handling]**

- Create a supplementary lookup table for 'edge case' foods with known sensitivities:
  - Fortified foods (added vitamins, minerals)
  - Foods with sugar alcohols (sorbitol, xylitol, stevia, etc.)
  - High-FODMAP foods
  - Foods with common additives/preservatives users avoid
  - Origin/sourcing information (grass-fed, organic, wild-caught, etc.)
  - Certification data (Vegan, Halal, Kosher, Fair Trade, etc.)
- When food is loaded, check this table and surface relevant metadata in modal
- Structure:
  ```
  edge_case_id
  food_id (FK or usda_fdc_id reference)
  edge_case_type (enum: fortified, sugar_alcohol, high_fodmap, additives, sourcing, certification, other)
  description (human-readable)
  value (ingredient/compound name)
  ```

## Workflow Summary:

1. User types food name → Queries USDA API
2. User selects food from results → 'Inspect Data' button appears
3. User clicks 'Inspect Data' → Modal opens with:
   - Raw JSON from USDA
   - Serving size selector
   - Data preview (USDA → DB mapping)
   - Auto-detected allergens (with keyword matches highlighted)
   - Manual allergen checklist
   - Edge case warnings (if applicable)
4. User reviews data and confirms allergens
5. On save confirmation:
   - Insert into `foods` table with mapped data
   - Insert into `food_allergens` table (user-flagged + auto-detected)
   - Insert into edge case lookup table (if applicable)
   - Local meal entry references this food_id with user's portion amount

## Acceptance Criteria:

- ✅ Modal displays complete raw JSON response
- ✅ Serving size is selectable/preview-able
- ✅ Data preview shows USDA → DB mapping clearly
- ✅ Allergen warnings appear for detected keywords
- ✅ User can manually flag additional allergens
- ✅ Disclaimer about USDA allergen data gap is prominent
- ✅ 'Inspect Data' buttons appear in both Log a Meal + Today's Meals sections
- ✅ Modal closes cleanly
- ✅ Placeholder comments in code for Phase 4 expansions (allergen DB, external sources, edge cases)

## Notes for Future Development:

- Phase 4 allergen database can be built independently without blocking Phases 1-3
- External allergen integrations should be non-blocking (graceful fallback if API unavailable)
- Edge case data can be manually curated or crowdsourced over time
- Consider performance: cache USDA responses and mappings to reduce API calls
