-- EAV (Entity-Attribute-Value) Schema Migration
-- This enables flexible, schema-less data storage for collections like circles, house types, social posts
-- Users remain in dedicated tables for authentication

-- Entity Types Table (defines what kinds of entities exist: 'circle', 'house_type', 'social_post', etc.)
CREATE TABLE IF NOT EXISTS entity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    description TEXT,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    schema JSONB DEFAULT '{}',  -- JSON Schema for validation (optional)
    icon VARCHAR(100),
    is_system BOOLEAN DEFAULT false,  -- System types cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entities Table (instances of entity types)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type_id UUID NOT NULL REFERENCES entity_types(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    owner_id UUID,  -- Reference to user who created this (optional)
    status VARCHAR(50) DEFAULT 'active',  -- active, archived, deleted
    metadata JSONB DEFAULT '{}',  -- Quick access to commonly queried fields
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entity Attributes Table (EAV core - stores individual attribute values)
CREATE TABLE IF NOT EXISTS entity_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_type VARCHAR(50) DEFAULT 'text',  -- text, number, boolean, json, date, datetime, reference
    value_text TEXT,
    value_number NUMERIC,
    value_boolean BOOLEAN,
    value_json JSONB,
    value_date DATE,
    value_datetime TIMESTAMP WITH TIME ZONE,
    value_reference UUID,  -- For referencing other entities
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_id, attribute_name)
);

-- Entity Relations Table (for many-to-many relationships between entities)
CREATE TABLE IF NOT EXISTS entity_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relation_type VARCHAR(100) NOT NULL,  -- 'member_of', 'parent_of', 'related_to', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_entity_id, target_entity_id, relation_type)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_entity_types_name ON entity_types(name);
CREATE INDEX IF NOT EXISTS idx_entity_types_app ON entity_types(application_id);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_entities_app ON entities(application_id);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_owner ON entities(owner_id);
CREATE INDEX IF NOT EXISTS idx_entities_metadata ON entities USING GIN(metadata);

CREATE INDEX IF NOT EXISTS idx_entity_attrs_entity ON entity_attributes(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_attrs_name ON entity_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS idx_entity_attrs_text ON entity_attributes(value_text) WHERE value_text IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entity_attrs_number ON entity_attributes(value_number) WHERE value_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entity_attrs_json ON entity_attributes USING GIN(value_json) WHERE value_json IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_entity_relations_source ON entity_relations(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relations_target ON entity_relations(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relations_type ON entity_relations(relation_type);

-- Seed default entity types
INSERT INTO entity_types (name, display_name, description, icon, is_system) VALUES
    ('circle', 'Circle', 'Group or family circle', 'users', true),
    ('house_type', 'House Type', 'Category for circles/houses', 'home', true),
    ('social_post', 'Social Post', 'User-generated social content', 'message-square', true),
    ('note', 'Note', 'User notes and memos', 'file-text', true),
    ('todo', 'Todo', 'Tasks and to-do items', 'check-square', true),
    ('calendar_event', 'Calendar Event', 'Scheduled events', 'calendar', true)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    updated_at = NOW();

-- Helper function to get entity with all attributes as JSONB
CREATE OR REPLACE FUNCTION get_entity_with_attributes(p_entity_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', e.id,
        'type', et.name,
        'type_id', e.entity_type_id,
        'application_id', e.application_id,
        'owner_id', e.owner_id,
        'status', e.status,
        'metadata', e.metadata,
        'created_at', e.created_at,
        'updated_at', e.updated_at,
        'attributes', COALESCE(
            (SELECT jsonb_object_agg(
                ea.attribute_name,
                CASE 
                    WHEN ea.attribute_type = 'number' THEN to_jsonb(ea.value_number)
                    WHEN ea.attribute_type = 'boolean' THEN to_jsonb(ea.value_boolean)
                    WHEN ea.attribute_type = 'json' THEN ea.value_json
                    WHEN ea.attribute_type = 'date' THEN to_jsonb(ea.value_date)
                    WHEN ea.attribute_type = 'datetime' THEN to_jsonb(ea.value_datetime)
                    WHEN ea.attribute_type = 'reference' THEN to_jsonb(ea.value_reference)
                    ELSE to_jsonb(ea.value_text)
                END
            ) FROM entity_attributes ea WHERE ea.entity_id = e.id),
            '{}'::jsonb
        )
    ) INTO result
    FROM entities e
    JOIN entity_types et ON e.entity_type_id = et.id
    WHERE e.id = p_entity_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- View for easier querying of entities with their attributes
CREATE OR REPLACE VIEW entities_view AS
SELECT 
    e.id,
    et.name as entity_type,
    et.display_name as entity_type_display,
    e.application_id,
    e.owner_id,
    e.status,
    e.metadata,
    e.created_at,
    e.updated_at,
    get_entity_with_attributes(e.id) as full_entity
FROM entities e
JOIN entity_types et ON e.entity_type_id = et.id;

-- Comment describing the schema
COMMENT ON TABLE entity_types IS 'Defines the types of entities that can be stored (like tables in traditional DB)';
COMMENT ON TABLE entities IS 'Instances of entity types (like rows in traditional DB)';
COMMENT ON TABLE entity_attributes IS 'Individual attribute values for entities (EAV pattern)';
COMMENT ON TABLE entity_relations IS 'Relationships between entities (many-to-many)';
