require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ============ DATA STORAGE (In-memory for demo) ============
let users = [];
let groups = [];
let memberships = [];
let expenses = [];
let splits = [];
let settlements = [];

// ============ INITIALIZE SEED USERS ============
async function initializeUsers() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  users = [
    { id: 1, name: "Aisha", email: "aisha@flatmate.com", password: hashedPassword },
    { id: 2, name: "Rohan", email: "rohan@flatmate.com", password: hashedPassword },
    { id: 3, name: "Priya", email: "priya@flatmate.com", password: hashedPassword },
    { id: 4, name: "Meera", email: "meera@flatmate.com", password: hashedPassword },
    { id: 5, name: "Dev", email: "dev@flatmate.com", password: hashedPassword },
    { id: 6, name: "Sam", email: "sam@flatmate.com", password: hashedPassword },
    { id: 7, name: "Kabir", email: "kabir@flatmate.com", password: hashedPassword }
  ];
  console.log("✅ Seed users created:", users.map(u => u.email).join(", "));
}

// ============ ANOMALY DETECTION ENGINE ============
const ANOMALY_TYPES = {
  EMPTY_PAID_BY: 'empty_paid_by',
  SETTLEMENT_AS_EXPENSE: 'settlement_as_expense',
  DUPLICATE_EXPENSE: 'duplicate_expense',
  FUTURE_MEMBER_IN_SPLIT: 'future_member_in_split',
  DEPARTED_MEMBER_IN_SPLIT: 'departed_member_in_split',
  INVALID_DATE_FORMAT: 'invalid_date_format',
  MISSING_CURRENCY: 'missing_currency',
  COMMA_IN_AMOUNT: 'comma_in_amount',
  PERCENTAGE_SUM_MISMATCH: 'percentage_sum_mismatch',
  UNKNOWN_SPLIT_TYPE: 'unknown_split_type',
  NEGATIVE_AMOUNT: 'negative_amount'
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try DD-MM-YYYY
  let match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) return new Date(`${match[3]}-${match[2]}-${match[1]}`);
  
  // Try MMM-DD (Mar-14)
  match = dateStr.match(/^([A-Za-z]{3})-(\d{1,2})$/);
  if (match) {
    const monthMap = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
    const year = new Date().getFullYear();
    return new Date(year, monthMap[match[1]], parseInt(match[2]));
  }
  
  return null;
}

function detectAnomalies(row, index, existingExpenses) {
  const anomalies = [];
  
  if (!row.paid_by || row.paid_by.trim() === '') {
    anomalies.push({
      type: ANOMALY_TYPES.EMPTY_PAID_BY,
      row: index,
      field: 'paid_by',
      message: 'No payer specified',
      action: 'reject'
    });
  }
  
  if (!row.split_type || row.split_type.trim() === '') {
    anomalies.push({
      type: ANOMALY_TYPES.SETTLEMENT_AS_EXPENSE,
      row: index,
      message: 'This appears to be a settlement, not an expense',
      action: 'convert_to_settlement',
      settlement_from: row.paid_by,
      settlement_to: row.split_with,
      amount: row.amount
    });
  }
  
  const fingerprint = `${row.date}|${row.description}|${row.amount}|${row.paid_by}`;
  if (existingExpenses.has(fingerprint)) {
    anomalies.push({
      type: ANOMALY_TYPES.DUPLICATE_EXPENSE,
      row: index,
      message: 'Duplicate expense found',
      action: 'skip',
      duplicate_of: existingExpenses.get(fingerprint)
    });
  }
  existingExpenses.set(fingerprint, index);
  
  if (row.amount && typeof row.amount === 'string' && row.amount.includes(',')) {
    anomalies.push({
      type: ANOMALY_TYPES.COMMA_IN_AMOUNT,
      row: index,
      field: 'amount',
      message: 'Amount contains comma',
      action: 'fix',
      fixed_value: parseFloat(row.amount.replace(/,/g, ''))
    });
  }
  
  if (!row.currency || row.currency.trim() === '') {
    anomalies.push({
      type: ANOMALY_TYPES.MISSING_CURRENCY,
      row: index,
      message: 'Currency missing, defaulting to INR',
      action: 'fix',
      fixed_value: 'INR'
    });
  }
  
  const parsedDate = parseDate(row.date);
  if (!parsedDate) {
    anomalies.push({
      type: ANOMALY_TYPES.INVALID_DATE_FORMAT,
      row: index,
      field: 'date',
      message: `Unable to parse date: ${row.date}`,
      action: 'reject'
    });
  }
  
  const amountNum = parseFloat(row.amount?.toString().replace(/,/g, '') || 0);
  if (amountNum < 0) {
    anomalies.push({
      type: ANOMALY_TYPES.NEGATIVE_AMOUNT,
      row: index,
      message: 'Negative amount detected - treating as refund',
      action: 'fix',
      original_amount: amountNum,
      is_refund: true
    });
  }
  
  if (row.split_type === 'percentage' && row.split_details) {
    const percentages = row.split_details.match(/(\d+(?:\.\d+)?)%/g);
    if (percentages) {
      let sum = 0;
      percentages.forEach(p => { sum += parseFloat(p); });
      if (Math.abs(sum - 100) > 0.01) {
        anomalies.push({
          type: ANOMALY_TYPES.PERCENTAGE_SUM_MISMATCH,
          row: index,
          message: `Percentages sum to ${sum}%, not 100%`,
          action: 'fix',
          original_sum: sum,
          fix_note: 'Will normalize proportionally'
        });
      }
    }
  }
  
  return anomalies;
}

function processRow(row, anomalies) {
  const criticalAnomalies = anomalies.filter(a => a.action === 'reject');
  if (criticalAnomalies.length > 0) {
    return { success: false, anomalies, rejected: true };
  }
  
  let processedRow = { ...row };
  for (const anomaly of anomalies) {
    if (anomaly.action === 'fix') {
      switch (anomaly.type) {
        case ANOMALY_TYPES.COMMA_IN_AMOUNT:
          processedRow.amount = anomaly.fixed_value;
          break;
        case ANOMALY_TYPES.MISSING_CURRENCY:
          processedRow.currency = anomaly.fixed_value;
          break;
        case ANOMALY_TYPES.NEGATIVE_AMOUNT:
          processedRow.is_refund = true;
          processedRow.amount = Math.abs(anomaly.original_amount);
          break;
      }
    }
  }
  
  return { success: true, processedRow, anomalies, converted_to_settlement: anomalies.some(a => a.action === 'convert_to_settlement') };
}

// ============ API ROUTES ============

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword
    };
    users.push(newUser);
    
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    console.log('Available users:', users.map(u => u.email));
    
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    console.log('Login successful for:', email);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// IMPORT ROUTES
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/import/preview', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  
  const results = [];
  const existingFingerprints = new Map();
  let rowIndex = 0;
  
  const buffer = file.buffer.toString();
  const stream = Readable.from(buffer);
  
  stream
    .pipe(csv())
    .on('data', (row) => {
      const anomalies = detectAnomalies(row, rowIndex, existingFingerprints);
      const processed = processRow(row, anomalies);
      results.push({
        original_row: row,
        row_number: rowIndex,
        anomalies: anomalies,
        accepted: !processed.rejected,
        converted_to_settlement: processed.converted_to_settlement,
        processed_data: processed.processedRow
      });
      rowIndex++;
    })
    .on('end', () => {
      const acceptedRows = results.filter(r => r.accepted);
      const rejectedRows = results.filter(r => !r.accepted);
      const settlementsDetected = results.filter(r => r.converted_to_settlement);
      
      res.json({
        total_rows: results.length,
        accepted_count: acceptedRows.length,
        rejected_count: rejectedRows.length,
        settlements_detected: settlementsDetected.length,
        anomalies_by_type: results.flatMap(r => r.anomalies.map(a => a.type)).reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        rows: results,
        preview_data: acceptedRows.slice(0, 10).map(r => r.processed_data)
      });
    });
});

app.post('/api/import/confirm', async (req, res) => {
  const { confirmed_rows } = req.body;
  
  // Save to expenses array
  for (const row of confirmed_rows) {
    if (row.processed_data && !row.converted_to_settlement) {
      expenses.push({
        id: expenses.length + 1,
        ...row.processed_data,
        imported_at: new Date()
      });
    }
  }
  
  res.json({
    success: true,
    imported_count: confirmed_rows.length,
    message: `Successfully imported ${confirmed_rows.length} expenses`
  });
});

// BALANCE ROUTES
app.get('/api/balances/:groupId/:userId', async (req, res) => {
  res.json({
    user_id: req.params.userId,
    group_id: req.params.groupId,
    total_owed: 0,
    total_owes: 0,
    net_balance: 0,
    breakdown: []
  });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', users: users.length });
});

// START SERVER
async function startServer() {
  await initializeUsers();
  app.listen(port, () => {
    console.log(`\n🚀 Server running on port ${port}`);
    console.log(`📧 Demo logins:`);
    users.forEach(u => console.log(`   ${u.email} / password123`));
    console.log(`\n✅ Ready to accept requests\n`);
  });
}

startServer();