-- Sales history table for PDV
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sales"
ON sales FOR ALL
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sales_clinic_id ON sales(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
