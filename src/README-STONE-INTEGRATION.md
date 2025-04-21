
# Stone Integration Guide

To properly use the Stone payment integration, you need to add the required columns to your payment_settings table in Supabase.

## Database Schema Update

Run the following SQL query in your Supabase SQL Editor:

```sql
-- Add Stone payment provider columns to the payment_settings table
ALTER TABLE payment_settings
ADD COLUMN IF NOT EXISTS stone_code TEXT,
ADD COLUMN IF NOT EXISTS merchant_name TEXT,
ADD COLUMN IF NOT EXISTS sandbox_mode BOOLEAN DEFAULT TRUE;
```

## Stone Configuration

For each laundry location you want to enable Stone payments:

1. Insert a record in the payment_settings table:

```sql
INSERT INTO payment_settings (laundry_id, provider, stone_code, merchant_name, sandbox_mode)
VALUES 
('your-laundry-uuid', 'stone', 'YOUR_STONE_CODE', 'YOUR_MERCHANT_NAME', TRUE);
```

Replace:
- `your-laundry-uuid` with your laundry's ID
- `YOUR_STONE_CODE` with your Stone activation code
- `YOUR_MERCHANT_NAME` with your registered merchant name
- Set sandbox_mode to FALSE for production environment

## Mobile Integration

For full Stone TEF integration with physical card readers, you'll need to:

1. Build your app using React Native or another mobile framework
2. Install the Stone SDK in your project
3. Create appropriate native modules for React Native

The current implementation provides a web-compatible mock that simulates Stone payments for testing and development purposes.

