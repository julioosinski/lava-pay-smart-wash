
-- Add Stone payment provider columns to the payment_settings table
ALTER TABLE payment_settings
ADD COLUMN IF NOT EXISTS stone_code TEXT,
ADD COLUMN IF NOT EXISTS merchant_name TEXT,
ADD COLUMN IF NOT EXISTS sandbox_mode BOOLEAN DEFAULT TRUE;
