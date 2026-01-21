# Fix "Take Now" Button Size

## Problem Diagnosis

The "Take Now" button is too large because:

1. **`flex-1` makes it grow**: The button uses `flex-1` which makes it fill ALL remaining horizontal space in the flex container
2. **Icon buttons are 32px**: The two icon buttons are `h-8 w-8` (32px each)
3. **Take Now fills the rest**: With `flex-1`, the Take Now button takes up the entire remaining width

## Current Implementation

```tsx
<div className="flex justify-center gap-1.5 items-center">
  <Button className="h-8 w-8">Eye</Button>
  <Button className="h-8 w-8">Calendar</Button>
  <Button size="sm" className="h-6 px-2 text-xs flex-1">
    Take Now
  </Button>{' '}
  // ← flex-1 is the problem
</div>
```

## Solution

Replace `flex-1` with a fixed width or remove flex-grow behavior entirely. Options:

### Option 1: Fixed Small Width (Recommended)

Remove `flex-1` and set a specific small width:

```tsx
<Button size="sm" onClick={onTake} className="h-7 px-2 text-xs w-20">
  Take Now
</Button>
```

- `w-20` = 80px (about 2.5x the icon button width)
- Compact and predictable size
- No flex-grow behavior

### Option 2: Even Smaller Fixed Width

```tsx
<Button size="sm" onClick={onTake} className="h-7 px-1.5 text-[11px] w-16">
  Take Now
</Button>
```

- `w-16` = 64px (exactly 2x the icon button width)
- Very compact
- May need smaller font size `text-[11px]`

### Option 3: Match Icon Button Size More Closely

```tsx
<Button size="sm" onClick={onTake} className="h-8 px-2 text-[10px] w-24">
  Take Now
</Button>
```

- `h-8` matches icon buttons
- `w-24` = 96px
- Better visual alignment

## Implementation Plan

**File to modify**: `src/components/supplements/SupplementCard.tsx` (line 71)

**Change**:

```tsx
// FROM:
<Button size="sm" onClick={onTake} className="h-6 px-2 text-xs flex-1">
  Take Now
</Button>

// TO (Option 1 - Recommended):
<Button size="sm" onClick={onTake} className="h-7 px-2 text-xs w-20">
  Take Now
</Button>
```

## Verification

1. **Visual check**: Button should be much smaller, not stretching to fill the card width
2. **Size comparison**: Button should be roughly 2-3x the width of the icon buttons
3. **Text readability**: "Take Now" text should still be readable at the smaller size
4. **Click target**: Button should still be easy to click (not too small)
5. **Layout**: All three buttons should be centered with consistent spacing

## Critical File

- `src/components/supplements/SupplementCard.tsx` (line 71) - Remove `flex-1` and add fixed width
