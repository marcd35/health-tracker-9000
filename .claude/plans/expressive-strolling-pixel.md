# Implementation Plan: Fix Supplement Logs Issues

## Overview

Two issues need to be addressed on the supplements page:

1. **Nutrient Progress Bug**: The `calculateNutrientProgress` function has an unused date parameter causing confusion
2. **Missing Edit Functionality**: Users cannot edit supplement log timestamps after creation

## Issue 1: Fix Nutrient Progress Calculation

### Root Cause

The function signature `calculateNutrientProgress(_date: string)` accepts a date parameter but never uses it. The function reads directly from store state (`todayLogs`, `supplements`, `nutrientTargets`). This causes an ESLint warning and creates confusion about the API contract.

### Solution

Remove the unused date parameter to clarify that this is a pure computation on current store state. The caller's responsibility is to ensure `todayLogs` is current by calling `fetchTodayLogs(date)` first.

### Changes Required

**File: `src/lib/store/supplementStore.ts`**

- Line 46: Change interface from `calculateNutrientProgress: (date: string)` to `calculateNutrientProgress: ()`
- Line 228: Change implementation from `calculateNutrientProgress: (_date)` to `calculateNutrientProgress: ()`

**File: `src/app/supplements/page.tsx`**

- Lines 75-79: Update useMemo to call `calculateNutrientProgress()` without arguments
- Add correct dependencies: `[calculateNutrientProgress, todayLogs, supplements, nutrientTargets]`
- Remove ESLint disable comment

## Issue 2: Add Edit Functionality for Log Entries

### Architecture

Following the repository pattern:

```
User → Dialog → Store Action → API Endpoint → Repository → Database
                     ↓
            Refresh logs → Recalculate progress
```

### Implementation Steps

#### Step 1: Repository Method

**File: `src/lib/database/repositories/supplementRepository.ts`**

Add method after `deleteSupplementLog` (line 146):

```typescript
updateSupplementLog(id: string, takenAt: string): void {
  const stmt = this.db.prepare(`
    UPDATE supplement_logs
    SET taken_at = ?
    WHERE id = ?
  `);
  stmt.run(takenAt, id);
}
```

#### Step 2: API Endpoint

**File: `src/app/api/supplements/logs/route.ts`**

Add PUT handler:

- Parse request body for `id` and `takenAt`
- Validate both fields are present
- Validate ISO timestamp format
- Call `repo.updateSupplementLog(id, takenAt)`
- Return success/error response

#### Step 3: Store Action

**File: `src/lib/store/supplementStore.ts`**

Add to interface (around line 34):

```typescript
updateLog: (logId: string, takenAt: string, date: string) => Promise<void>;
```

Add implementation (around line 180):

- Call PUT `/api/supplements/logs` with id and takenAt
- On success: refresh logs via `fetchTodayLogs(date)`
- Show toast notifications for success/error
- Follow the pattern of `deleteLog` action

#### Step 4: Edit Dialog Component

**File: `src/components/supplements/EditLogDialog.tsx`** (NEW)

Create dialog component with:

- Props: `log`, `open`, `onOpenChange`, `onSave`
- HTML5 `<input type="time">` pre-filled with log's time
- Read-only display of log date for context
- Save button (disabled if no time)
- Uses `date-fns` to parse/format times
- Combines new time with existing log date to create ISO timestamp

#### Step 5: Update Log Item Component

**File: `src/components/supplements/SupplementLogItem.tsx`**

Changes:

- Add `onEdit: () => void` to props interface
- Import Pencil icon from lucide-react
- Add Edit button with pencil icon next to Delete button
- Style buttons as a button group

#### Step 6: Integrate into Page

**File: `src/app/supplements/page.tsx`**

Changes:

- Import `EditLogDialog` and `updateLog`
- Add state: `const [editingLog, setEditingLog] = useState<SupplementLog | null>(null)`
- Add handler: `handleEditLog(logId: string, takenAt: string)` that calls `updateLog`
- Pass `onEdit={() => setEditingLog(log)}` to `SupplementLogItem`
- Render `EditLogDialog` with `editingLog` at bottom of component

## Critical Files

- `src/lib/store/supplementStore.ts` - Store with both fixes
- `src/app/supplements/page.tsx` - Page component updates
- `src/lib/database/repositories/supplementRepository.ts` - Add updateSupplementLog
- `src/app/api/supplements/logs/route.ts` - Add PUT handler
- `src/components/supplements/EditLogDialog.tsx` - NEW component
- `src/components/supplements/SupplementLogItem.tsx` - Add edit button

## Implementation Order

1. **Fix nutrient progress** (store + page)
2. **Backend support** (repository + API)
3. **Store action** (updateLog)
4. **UI components** (EditLogDialog + SupplementLogItem + page integration)

## Verification Steps

### Test Nutrient Progress Fix

1. Add two supplements with vitamin C (100mg and 50mg)
2. Log first supplement twice → verify shows 200mg
3. Log second supplement once → verify shows 250mg
4. Delete one log → verify shows 150mg
5. Check browser console for ESLint warnings → should be none

### Test Edit Functionality

1. Log a supplement at current time
2. Click edit button (pencil icon)
3. Verify dialog opens with current time pre-filled
4. Change time to 2 hours earlier
5. Click "Save Changes"
6. Verify log shows new timestamp
7. Verify nutrient progress updates correctly
8. Refresh page → verify changes persist
9. Test keyboard navigation (Tab, Enter, Escape)

### Edge Cases

- Edit to 12:01 AM and 11:59 PM
- Cancel edit (no changes saved)
- Edit multiple logs in sequence
- Verify logs remain sorted chronologically

## Success Criteria

- [ ] No ESLint warnings in console
- [ ] Nutrient progress updates immediately when logs change
- [ ] Edit button appears on all log entries
- [ ] Edit dialog opens with correct pre-filled time
- [ ] Time changes save to database and persist
- [ ] Nutrient progress recalculates after edit
- [ ] Toast notifications appear for success/error
- [ ] Keyboard navigation works throughout
- [ ] No console errors during testing
- [ ] Follows existing code patterns and conventions
