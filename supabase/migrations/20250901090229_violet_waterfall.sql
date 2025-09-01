/*
  # BoliSeva Database Schema

  1. New Tables
    - `signups` - User registration data
      - `id` (uuid, primary key)
      - `name` (text, full name)
      - `dob` (date, date of birth)
      - `acc_no` (text, account number)
      - `bank_no` (text, bank number)
      - `ifsc_code` (text, IFSC code)
      - `phone_no` (text, phone number, unique)
      - `created_at` (timestamp)
    
    - `logins` - Login sessions and OTP management
      - `id` (uuid, primary key)
      - `phone_no` (text, phone number)
      - `otp` (text, current OTP)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
    
    - `loans` - Loan applications
      - `loan_id` (uuid, primary key)
      - `user_id` (uuid, foreign key to signups)
      - `status` (text, applied/pending/approved)
      - `amount` (numeric, loan amount)
      - `loan_type` (text, type of loan)
      - `purpose` (text, loan purpose)
      - `income` (numeric, monthly income)
      - `employment` (text, employment type)
      - `documents_verified` (boolean, KYC status)
      - `created_at` (timestamp)
    
    - `emis` - EMI schedule and payments
      - `emi_id` (uuid, primary key)
      - `loan_id` (uuid, foreign key to loans)
      - `due_date` (date, EMI due date)
      - `amount` (numeric, EMI amount)
      - `status` (text, paid/unpaid)
      - `reminder_sent` (boolean, reminder notification status)
      - `paid_date` (timestamp, payment date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Secure phone number based access control

  3. Indexes
    - Add indexes on frequently queried columns (phone_no, user_id, loan_id)
*/

-- Create signups table
CREATE TABLE IF NOT EXISTS signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dob date NOT NULL,
  acc_no text NOT NULL,
  bank_no text NOT NULL,
  ifsc_code text NOT NULL,
  phone_no text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create logins table
CREATE TABLE IF NOT EXISTS logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_no text NOT NULL,
  otp text NOT NULL,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  loan_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'pending', 'approved', 'rejected', 'disbursed')),
  amount numeric NOT NULL CHECK (amount > 0),
  loan_type text NOT NULL CHECK (loan_type IN ('personal', 'business', 'agriculture', 'education')),
  purpose text NOT NULL,
  income numeric NOT NULL CHECK (income > 0),
  employment text NOT NULL,
  documents_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create emis table
CREATE TABLE IF NOT EXISTS emis (
  emi_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(loan_id) ON DELETE CASCADE,
  due_date date NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue')),
  reminder_sent boolean DEFAULT false,
  paid_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE emis ENABLE ROW LEVEL SECURITY;

-- Create policies for signups
CREATE POLICY "Users can read own signup data"
  ON signups
  FOR SELECT
  TO authenticated
  USING (phone_no = current_setting('app.current_phone', true));

CREATE POLICY "Users can insert own signup data"
  ON signups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for logins
CREATE POLICY "Users can manage own login sessions"
  ON logins
  FOR ALL
  TO authenticated
  USING (phone_no = current_setting('app.current_phone', true));

-- Create policies for loans
CREATE POLICY "Users can read own loans"
  ON loans
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM signups WHERE phone_no = current_setting('app.current_phone', true)));

CREATE POLICY "Users can insert own loans"
  ON loans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM signups WHERE phone_no = current_setting('app.current_phone', true)));

CREATE POLICY "Users can update own loans"
  ON loans
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM signups WHERE phone_no = current_setting('app.current_phone', true)));

-- Create policies for emis
CREATE POLICY "Users can read own emis"
  ON emis
  FOR SELECT
  TO authenticated
  USING (loan_id IN (
    SELECT loan_id FROM loans 
    WHERE user_id IN (SELECT id FROM signups WHERE phone_no = current_setting('app.current_phone', true))
  ));

CREATE POLICY "Users can update own emis"
  ON emis
  FOR UPDATE
  TO authenticated
  USING (loan_id IN (
    SELECT loan_id FROM loans 
    WHERE user_id IN (SELECT id FROM signups WHERE phone_no = current_setting('app.current_phone', true))
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signups_phone_no ON signups(phone_no);
CREATE INDEX IF NOT EXISTS idx_logins_phone_no ON logins(phone_no);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_emis_loan_id ON emis(loan_id);
CREATE INDEX IF NOT EXISTS idx_emis_due_date ON emis(due_date);
CREATE INDEX IF NOT EXISTS idx_emis_status ON emis(status);