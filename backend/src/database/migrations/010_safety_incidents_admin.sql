-- Add admin tracking columns to safety_alerts table
ALTER TABLE safety_alerts 
ADD COLUMN IF NOT EXISTS acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_safety_alerts_acknowledged_by ON safety_alerts(acknowledged_by);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_resolved_by ON safety_alerts(resolved_by);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_acknowledged_at ON safety_alerts(acknowledged_at);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_resolved_at ON safety_alerts(resolved_at);

-- Update the status check constraint to include 'acknowledged'
ALTER TABLE safety_alerts DROP CONSTRAINT IF EXISTS safety_alerts_status_check;
ALTER TABLE safety_alerts ADD CONSTRAINT safety_alerts_status_check 
CHECK (status IN ('active', 'acknowledged', 'resolved', 'cancelled'));

-- Add device information columns
ALTER TABLE safety_alerts 
ADD COLUMN IF NOT EXISTS device_info TEXT,
ADD COLUMN IF NOT EXISTS app_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS battery_level INTEGER,
ADD COLUMN IF NOT EXISTS network_type VARCHAR(50);

-- Create emergency_contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  relationship VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for emergency_contacts
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_circle_id ON emergency_contacts(circle_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON emergency_contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_active ON emergency_contacts(is_active);

-- Create trigger for emergency_contacts updated_at
CREATE OR REPLACE FUNCTION update_emergency_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_emergency_contacts_updated_at 
BEFORE UPDATE ON emergency_contacts 
FOR EACH ROW EXECUTE FUNCTION update_emergency_contacts_updated_at();

-- Create safety_incident_contacts table to track which contacts were notified
CREATE TABLE IF NOT EXISTS safety_incident_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES safety_alerts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES emergency_contacts(id) ON DELETE CASCADE,
  contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for safety_incident_contacts
CREATE INDEX IF NOT EXISTS idx_safety_incident_contacts_incident_id ON safety_incident_contacts(incident_id);
CREATE INDEX IF NOT EXISTS idx_safety_incident_contacts_contact_id ON safety_incident_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_safety_incident_contacts_contacted ON safety_incident_contacts(contacted);

-- Create safety_incident_circle_members table to track which family members were notified
CREATE TABLE IF NOT EXISTS safety_incident_circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES safety_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for safety_incident_circle_members
CREATE INDEX IF NOT EXISTS idx_safety_incident_circle_members_incident_id ON safety_incident_circle_members(incident_id);
CREATE INDEX IF NOT EXISTS idx_safety_incident_circle_members_user_id ON safety_incident_circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_incident_circle_members_notified ON safety_incident_circle_members(notified);
