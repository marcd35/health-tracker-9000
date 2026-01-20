# USDA Food Data Integration with Data Mapping & Inspection

"Build a food data inspection and mapping system for the meal logging page that allows users to review USDA API data before database insertion.

## Phase 1: Data Inspection Modal ✅

## Phase 2: Data Extraction & Mapping Configuration ✅

## Phase 3: Allergen Detection (MVP) ✅

- ✅ Scan `ingredients` field for common allergen keywords:
  - ✅ Big 9: milk, eggs, peanuts, tree nuts, fish, shellfish, soy, wheat, sesame
  - ✅ Common additives: sulfites, dyes, MSG, artificial sweeteners
- ✅ For each detected allergen, display a warning in the modal:
  - ✅ 'Detected allergen: [allergen]' (orange/warning styling)
  - ✅ Show the ingredient snippet where it was found
- ✅ Include disclaimer: "This is keyword-based detection. Always verify actual allergen statements on packaging."

10. **Manual Allergen Flagging ✅** (Implemented in Phase 3 optimization)

---

**[MOVED TO docs/backlog/future-enhancements.md]**

- Phase 4: Allergen Mapping Table
- External Allergen Database Integration
- Edge Case & Unique Foods Handling

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
- ✅ Copy to Clipboard button functionality implemented
- ✅ Serving size is selectable/preview-able (Initial version uses standard 100g/serving defaults)
- ✅ Data preview shows USDA → DB mapping clearly
- ✅ Allergen warnings appear for detected keywords
- ✅ Disclaimer about USDA allergen data gap is prominent
- ✅ 'Inspect Data' buttons appear in both Log a Meal + Today's Meals sections
- ✅ Modal closes cleanly
- ✅ Placeholder comments in code for Phase 4 expansions (allergen DB, external sources, edge cases)

## Notes for Future Development:

- Phase 4 allergen database can be built independently without blocking Phases 1-3
- External allergen integrations should be non-blocking (graceful fallback if API unavailable)
- Edge case data can be manually curated or crowdsourced over time
- Consider performance: cache USDA responses and mappings to reduce API calls
