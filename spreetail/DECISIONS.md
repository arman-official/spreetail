# DECISIONS.md - Decision Log

## Decision 1: Anomaly Handling Strategy
**Chosen:** Preview + User Confirmation
**Why:** Meera requested approval for any changes. Silent fixes would violate this.

## Decision 2: Currency Conversion  
**Chosen:** Historical daily rates with fallback
**Why:** Priya's USD complaint requires fair conversion, not fixed rates.

## Decision 3: User Matching
**Chosen:** Fuzzy matching (Levenshtein distance)
**Why:** CSV has "priya", "Priya", "Priya S" - all same person.

## Decision 4: Time-Scoped Memberships
**Chosen:** Filter by join/leave dates in balance calc
**Why:** Sam's request about March electricity.

## Decision 5: Settlement Detection
**Chosen:** Auto-detect by empty split_type
**Why:** Row 25 explicitly says "this is a settlement not an expense"