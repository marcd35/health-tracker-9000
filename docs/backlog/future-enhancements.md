# Future Enhancements (Post-MVP)

### Future Phase 1: Bloodwork Integration

- [ ] Design bloodwork data model
- [ ] Create bloodwork upload/parsing functionality
- [ ] Integrate bloodwork markers with recommendations
- [ ] Track bloodwork changes over time

### Future Phase 2: Workout Tracking

- [ ] Design workout data model
- [ ] Create workout logging interface
- [ ] Calculate calories burned
- [ ] Adjust nutritional targets based on workout days
- [ ] Show workout history and trends

### Future Phase 3: Advanced Analytics

- [ ] Correlation analysis (meals vs health score)
- [ ] Predictive analytics for gout flares
- [ ] Weekly/monthly reports
- [ ] Export data to CSV/PDF
- [ ] Advanced charting (heatmaps, trends)

### Future Phase 4: Mobile Experience

- [ ] PWA configuration for offline support
- [ ] Mobile app (React Native or similar)
- [ ] Quick meal logging shortcuts
- [ ] Photo-based meal logging
- [ ] Push notifications for supplement reminders

### Future Phase 5: AI Integration

- [ ] Perplexity API for latest health research
- [ ] Smart meal suggestions based on gaps
- [ ] Natural language meal logging ("I had chicken and rice")
- [ ] Personalized research summaries

### Future Phase 6: Social/Sharing Features

- [ ] Export health reports to share with doctor
- [ ] Generate shareable health snapshots
- [ ] Import recipes from websites
- [ ] Meal planning feature

### Future Phase 7: Advanced Health Features

- [ ] Symptom correlation tracking
- [ ] Medication tracking and interactions
- [ ] Sleep quality tracking
- [ ] Stress/mood tracking
- [ ] Blood glucose tracking integration

### Future Phase 8: Supabase Integration

- [ ] Move food database to Supabase
- [ ] Implement real-time sync
- [ ] Keep personal data local, food data remote
- [ ] Build admin panel for managing food database

### Future Phase 9 (can be sooner): Meal Planning

- [ ] Integrate a supplementary allergen database like:
- [ ] FatSecret API - has allergen data
- [ ] Open Food Facts - crowdsourced allergen labels
- [ ] Thinkladder allergen database - comprehensive allergen info

### Future Phase 10: USDA Integration Expansions

- [ ] **Manual Allergen Flagging**
  - Allow user to manually check/uncheck allergens in a checklist
  - Store manually-flagged allergens separately from auto-detected ones
  - Save flags to the `food_allergens` mapping table (Future Phase 11)

- [ ] **Allergen Reference Mapping Table**
  - Build a `food_allergens` lookup table in database (food_id, allergen_type, source, confidence, notes)
  - Pre-populate allergen warnings based on this table
  - Allow users to contribute/correct allergen data

- [ ] **External Allergen Database Integration**
  - Integrate with external sources (FatSecret, Open Food Facts) for deeper allergen coverage
  - Async lookup to avoid blocking modal display

- [ ] **Edge Case & Unique Foods Handling**
  - Create a supplementary lookup table for 'edge case' foods (sugar alcohols, high-FODMAP, certified claims)
  - Surface relevant metadata in inspection modal
