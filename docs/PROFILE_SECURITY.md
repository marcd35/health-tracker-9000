# Profile Security Architecture

## Overview

User profile data is stored **exclusively in `data/profile.json`** for security purposes. Profile information is **never** stored in the SQLite database.

## Security Rationale

- **Separation of Concerns**: Sensitive personal information (age, weight, height, gender, health conditions, allergies) is isolated from the database
- **Easy Encryption**: JSON file can be easily encrypted at rest without affecting database performance
- **Simpler Compliance**: Health data privacy requirements (HIPAA, GDPR) easier to implement on isolated file
- **Backup Flexibility**: Profile data can be backed up separately with different security policies

## Implementation Details

### Storage Location

```
data/profile.json
```

### Database Schema

- **NO** `profile` table exists in the database
- Tables reference `profile_id` but **WITHOUT** FK constraints
- No profile data is duplicated to database

### Affected Tables

The following tables reference `profile_id` but do NOT have FK constraints:

- `calorie_goals`
- `calorie_goal_history`
- `daily_calorie_tracking`
- `calorie_streaks`
- `user_conditions`
- `user_allergies`
- `nutritional_targets`
- `weight_logs`

### Repository Pattern

`ProfileRepository` (src/lib/database/repositories/profileRepository.ts):

- ✅ Reads from `profile.json` only
- ✅ Writes to `profile.json` only
- ❌ NO database sync operations
- ❌ NO database table interactions

## Migration History

- **Migration 016** (`016_remove_profile_fk.sql`): Removed all FK constraints to `profile` table and dropped the table entirely

## Data Integrity

Since there are no FK constraints, the application layer is responsible for:

- Ensuring `profile_id` references are valid
- Handling profile deletion scenarios
- Maintaining referential integrity in code

## Future Enhancements

Consider implementing:

- Encryption of `profile.json` at rest
- Secure backup mechanisms for profile data
- Profile data export with encryption
- Multi-profile support with separate encrypted files
