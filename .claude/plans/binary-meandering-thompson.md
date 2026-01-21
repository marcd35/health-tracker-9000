# Segmented Progress Bar Redesign - Implementation Plan

## Overview

Redesign the `ToxicityProgressBar` component to use a segmented progress bar for the goal zone (0-100%) while maintaining smooth fill for the overage zone (toxicity tracking). This provides clearer visual feedback on progress increments while preserving precision through partial segment fills using gradients.

## User Requirements

- **Goal zone (0-100%)**: 10 hard-corner segments representing 10% each
- **Precision**: Show partial segment fills (e.g., 73% = 7 full + 0.3 partial segment)
- **Overage zone (100%+)**: Keep smooth fill for warning/toxic tracking
- **Maintain all existing features**: tooltips, markers, status indicators, toxicity tracking

## Current Implementation

**File**: `src/components/supplements/ToxicityProgressBar.tsx`

- Dual-zone layout: 90% goal zone + 10% overage zone
- Smooth continuous fill with color transitions
- Rich tooltip, status indicators, 100% and toxic limit markers
- Height: 32px (h-8)

## Design Approach

### Visual Design

- **10 segments** in goal zone, each representing 10%
- **Hard corners** (rounded-none) for segments
- **4px gaps** (gap-1) between segments for clear separation
- **Partial fills** via CSS linear gradients for precision
- **Colors**:
  - Empty: `bg-secondary/40` (muted gray)
  - Filled: `bg-green-500` (solid green)
  - Partial: gradient from green to empty color

### Technical Approach

Use `Array.from({ length: 10 })` with `.map()` to render segments (pattern from `SegmentedCalorieBar.tsx`):

- Calculate which segments are filled, partial, or empty
- Apply gradient to partial segment for precision (e.g., 73% shows 7.3 segments)
- Keep overage zone smooth fill with existing color logic
- Maintain all existing markers, tooltips, and status indicators

## Implementation Steps

### Step 1: Replace Goal Zone with Segmented Container

**Location**: `src/components/supplements/ToxicityProgressBar.tsx:88-100` (approx)

Replace the smooth fill goal zone div with a flex container:

```tsx
{
  /* Before: smooth fill */
}
<div className="relative flex-1 flex items-stretch">
  <div
    className={cn('h-full transition-all duration-500', goalZoneColor)}
    style={{ width: `${goalZonePercent}%` }}
  />
  {/* markers */}
</div>;

{
  /* After: segmented with 10 segments */
}
<div className="relative flex-1 flex gap-1">
  {Array.from({ length: 10 }, (_, index) => renderSegment(index))}
  {/* markers */}
</div>;
```

### Step 2: Implement Segment Rendering Logic

Add segment rendering within the goal zone container:

```tsx
{
  Array.from({ length: 10 }, (_, index) => {
    const segmentStartPercent = index * 10;
    const segmentEndPercent = (index + 1) * 10;

    const isFilled = percentageOfTarget >= segmentEndPercent;
    const isPartial =
      percentageOfTarget > segmentStartPercent && percentageOfTarget < segmentEndPercent;
    const isEmpty = percentageOfTarget <= segmentStartPercent;

    // Calculate partial fill for gradient
    const partialFillPercent = isPartial
      ? ((percentageOfTarget - segmentStartPercent) / 10) * 100
      : 0;

    return (
      <div
        key={index}
        className={cn('h-full flex-1 rounded-none transition-all duration-500', {
          'bg-green-500': isFilled,
          'bg-secondary/40': isEmpty,
        })}
        style={
          isPartial
            ? {
                background: `linear-gradient(to right, rgb(34 197 94) ${partialFillPercent}%, hsl(var(--secondary) / 0.4) ${partialFillPercent}%)`,
              }
            : undefined
        }
      />
    );
  });
}
```

### Step 3: Remove Old Goal Zone Color Logic

Delete or update the `goalZoneColor` calculation since segments now have individual colors:

- Remove the conditional logic for red/yellow/green based on progress
- Keep `percentageOfTarget` calculation (used by segment logic)

### Step 4: Keep Overage Zone Unchanged

No changes needed to the overage zone - it already uses smooth fill:

```tsx
{
  /* Overage zone (10% of bar width) - unchanged */
}
<div className="relative w-[10%] flex items-stretch border-l border-dashed ...">
  <div
    className={cn('h-full transition-all duration-500', overageZoneColor)}
    style={{ width: `${overageZoneFill}%` }}
  />
  {/* toxic marker */}
</div>;
```

### Step 5: Verify All Features Maintained

Ensure these existing features still work:

- Tooltip with intake, target, warning, toxic levels
- Status indicators (Safe/Warning/TOXIC icons and text)
- Markers at 100% goal and toxic limit
- Smooth transitions (transition-all duration-500)
- Nutrients without toxicity levels (e.g., Vitamin K)
- Responsive table layout

## Critical Files

1. **src/components/supplements/ToxicityProgressBar.tsx** - Core component to modify
2. **src/components/meals/SegmentedCalorieBar.tsx** - Reference for segment pattern
3. **src/app/supplements/page.tsx** - Usage context (VitaminProgressCard, MineralProgressCard)
4. **src/constants/nutrients.ts** - Toxicity data reference

## Verification Testing

### Visual Tests (in supplements page)

Test these scenarios to verify segment rendering:

- **0% intake**: No segments filled
- **7.3% intake**: First segment shows gradient at ~73%
- **50% intake**: 5 full segments
- **73% intake**: 7 full segments + 8th segment with 30% gradient
- **99% intake**: 9 full + 10th at 90% gradient
- **100% intake**: All 10 segments filled
- **150% intake**: All segments filled + overage zone active

### Feature Tests

- [ ] Tooltip displays correctly on hover
- [ ] Status indicators show for warning/toxic states
- [ ] Markers visible at 100% and toxic limit
- [ ] Smooth transitions when data changes
- [ ] Works with nutrients lacking toxicity data
- [ ] Responsive in table layout
- [ ] Keyboard navigation works (tooltip accessibility)

### Edge Case Tests

- Very low values (1-5%)
- Extreme toxicity (2000%+)
- Nutrients without warning/toxic levels (Vitamin K, B12, etc.)
- Browser compatibility (Chrome, Firefox, Safari gradients)

## Visual Design Mockup

```
Goal Zone (90% width)          Overage (10%)
┌──────────────────────────┐  ┌────┐
│┌─┬─┬─┬─┬─┬─┬─┬▓┬─┬─┐     │  │ ░░ │
││█│█│█│█│█│█│█│▓│ │ │     │  │ ░░ │
│└─┴─┴─┴─┴─┴─┴─┴▓┴─┴─┘     │  │ ░░ │
│         ^     ^      ^    │  │ ^  │
│       70%   73%   100%    │  │Tox │
└──────────────────────────┘  └────┘

█ = filled (green)
▓ = partial (gradient)
  = empty (secondary/40)
░ = smooth fill (overage)
```

## Implementation Estimate

- Single component modification
- No prop changes, no breaking changes
- Straightforward segment rendering with existing patterns
- All existing features preserved

## Rollback Plan

Commit changes with clear message: `refactor: redesign ToxicityProgressBar with segmented goal zone`

Backup current implementation in case rollback needed.
