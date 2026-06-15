# AI_USAGE.md

## AI Tools Used
- Cursor IDE with GPT-4
- Claude 3.5 Sonnet for code review

## Key Prompts Used
1. "Write a CSV anomaly detection engine that identifies 10+ data problems including duplicates, missing fields, and invalid dates"
2. "Implement a greedy debt simplification algorithm that minimizes transactions between n people"
3. "Create a multi-step import wizard with preview, anomaly highlighting, and user confirmation"

## Three AI Failures Caught and Fixed

### Failure 1: Date Parsing Edge Cases
**AI Output:** Used `new Date(dateStr)` which failed on "Mar-14" format
**How I caught it:** Tested with actual CSV, got "Invalid Date" errors
**Fix:** Wrote custom parser with regex patterns for DD-MM-YYYY and MMM-DD formats

### Failure 2: Percentage Split Normalization
**AI Output:** Rejected rows with percentages that didn't sum to 100%
**How I caught it:** Row 14 has 30+30+30+20 = 110%, but user intent was clear
**Fix:** Changed to normalize proportionally instead of rejecting, with warning

### Failure 3: Duplicate Detection False Positives
**AI Output:** Used only description + amount for fingerprint
**How I caught it:** Two different dinners could have same amount ($84 beach shack vs another $84 expense)
**Fix:** Added date and paid_by to fingerprint: `${date}|${description}|${amount}|${paid_by}`