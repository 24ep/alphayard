ALTER TABLE circles
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "locationSharing": true,
  "familyChat": true,
  "emergencyAlerts": true,
  "familyCalendar": true,
  "familyExpenses": false,
  "familyShopping": true,
  "familyHealth": false,
  "familyEntertainment": true
}'::jsonb;
