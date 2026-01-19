# Profile Page Enhancements: Health Conditions & Allergies

## Overview
This feature aims to make the "Add Condition" and "Add Allergies" buttons on the profile page fully functional. Currently, these are placeholder buttons. The goal is to allow users to document their health profile more accurately, which can then be used to tailor recommendations and safety checks throughout the application.

## Goals
1.  **Functional UI**: Replace static buttons with interactive dialogs.
2.  **Standardized Input**: Provide a list of common conditions and allergies for quick selection.
3.  **Flexible Input**: Allow users to enter custom, free-text values if their specific condition or allergy is not listed.
4.  **Data Persistence**: robustly save these entries to the database, migrating from a simple JSON array to dedicated tables for better querying and scalability.

## Detailed Requirements

### 1. User Interface
*   **Trigger**: Clicking "Add Condition" or "Add Allergy" opens a modal/dialog.
*   **Search/Select**: The dialog features a searchable list (combobox/autocomplete).
    *   *Search*: Users can type to filter the list.
    *   *Create*: If the typed text does not match an existing option, a "Create '...'" option appears.
*   **Display**:
    *   Selected items appear as "chips" or "badges" on the profile page.
    *   Each chip has a "Remove" (X) button to delete the entry.
    *   Conditions are styled with a warning/alert theme (e.g., Orange).
    *   Allergies are styled with a danger/critical theme (e.g., Red).

### 2. content
#### Common Conditions
The following will be available as pre-defined suggestions:
*   Hypertension
*   Type 2 Diabetes
*   Asthma
*   Arthritis
*   Migraine
*   Depression
*   Anxiety
*   Insomnia
*   High Cholesterol
*   Thyroid Disorder
*   Gout

#### Common Allergies
The following will be available as pre-defined suggestions:
*   Peanuts
*   Tree Nuts
*   Milk
*   Eggs
*   Wheat
*   Soy
*   Fish
*   Shellfish
*   Penicillin
*   Latex
*   Dairy
*   Cheese
*   Whey

### 3. Backend & Data Model

#### Schema Changes
We will move away from storing these as JSON strings in the `profile` table to normalized tables.

**Table: `user_conditions`**
*   `id` (PK): UUID
*   `profile_id` (FK): Links to `profile.id`
*   `name`: Text (The condition name)
*   `created_at`: Timestamp

**Table: `user_allergies`**
*   `id` (PK): UUID
*   `profile_id` (FK): Links to `profile.id`
*   `name`: Text (The allergy name)
*   `created_at`: Timestamp

#### API Behavior
*   **GET /api/profile**: Will join/query these new tables and return them as arrays in the `UserProfile` object to maintain frontend compatibility.
*   **PUT /api/profile**: Will accept the full array of strings. It will perform a "sync" operation:
    1.  Delete all existing entries for the user in the respective table.
    2.  Insert all strings from the incoming array as new records.

## Future Considerations
*   **Severity Levels**: Future iterations could allow specifying the severity of an allergy (Mild, Severe, Anaphylactic).
*   **Start Date/Notes**: Allow adding context to conditions (e.g., "Diagnosed in 2010").
