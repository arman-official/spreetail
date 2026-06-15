# SCOPE.md - Anomaly Log & Database Schema

## Anomalies Detected in CSV (19 total)

| # | Anomaly | Example | Detection | Handling |
|---|---------|---------|-----------|----------|
| 1 | Empty paid_by | Row 23 | `!row.paid_by` | Reject row |
| 2 | Settlement as expense | Row 25 | `!row.split_type` | Convert to settlement |
| 3 | Duplicate expense | Rows 8-9 | Fingerprint hash | Skip duplicate |
| 4 | Future member in split | Row 46 (Meera Apr 2) | Compare join date | Filter out |
| 5 | Departed member | Row 34 (Meera Mar 25) | Compare leave date | Filter out |
| 6 | Invalid date | "Mar-14" | Regex match | Parse and log |
| 7 | Missing currency | Row 28 | `!row.currency` | Default INR |
| 8 | Comma in amount | "1,200" | `.includes(',')` | Strip commas |
| 9 | Percentage sum mismatch | Row 14 (90%) | Sum percentages | Normalize |
| 10 | Negative amount | Row -30 | `amount < 0` | Treat as refund |
| 11 | Case mismatch | "priya" vs "Priya" | Fuzzy match | Normalize |
| 12 | Unknown split type | "share" | Check enum | Validate shares |
| 13 | Zero amount | Row 0 | `amount === 0` | Skip expense |
| 14 | Missing split_with | Row | Check array | Reject row |
| 15 | Date out of range | Future date | Compare today | Warn user |
| 16 | Currency mismatch | USD in INR expense | Check consistency | Convert |
| 17 | Duplicate user names | "Priya S" vs "priya" | Levenshtein | Map to existing |
| 18 | Extra semicolon | "Aisha;;Rohan" | Split parsing | Clean array |
| 19 | UTF-8 BOM | File start | Detect BOM | Strip BOM |

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES users(id),
  joined_at DATE NOT NULL,
  left_at DATE,
  UNIQUE(group_id, user_id, joined_at)
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  paid_by_user_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  original_amount_usd DECIMAL(10,2),
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id),
  user_id UUID REFERENCES users(id),
  share_type VARCHAR(20), -- equal, percentage, share, unequal
  share_value DECIMAL(10,2),
  owed_amount DECIMAL(10,2)
);

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  settlement_date DATE NOT NULL,
  notes TEXT
);

CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  file_name VARCHAR(255),
  rows_total INT,
  rows_accepted INT,
  rows_rejected INT,
  created_at TIMESTAMP DEFAULT NOW()
);