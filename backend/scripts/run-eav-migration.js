const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'bondarys',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
};

if (process.env.DATABASE_URL) {
    poolConfig.connectionString = process.env.DATABASE_URL;
}

const pool = new Pool(poolConfig);

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('🚀 Running EAV Schema Migration...');

        // Create entity_types table
        console.log('📋 Creating entity_types table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS entity_types (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) UNIQUE NOT NULL,
                display_name VARCHAR(200),
                description TEXT,
                application_id UUID,
                schema JSONB DEFAULT '{}',
                icon VARCHAR(100),
                is_system BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Create entities table
        console.log('📋 Creating entities table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS entities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_type_id UUID NOT NULL REFERENCES entity_types(id) ON DELETE CASCADE,
                application_id UUID,
                owner_id UUID,
                status VARCHAR(50) DEFAULT 'active',
                metadata JSONB DEFAULT '{}',
                created_by UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Create entity_attributes table
        console.log('📋 Creating entity_attributes table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS entity_attributes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
                attribute_name VARCHAR(100) NOT NULL,
                attribute_type VARCHAR(50) DEFAULT 'text',
                value_text TEXT,
                value_number NUMERIC,
                value_boolean BOOLEAN,
                value_json JSONB,
                value_date DATE,
                value_datetime TIMESTAMP WITH TIME ZONE,
                value_reference UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(entity_id, attribute_name)
            )
        `);

        // Create entity_relations table
        console.log('📋 Creating entity_relations table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS entity_relations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                source_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
                target_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
                relation_type VARCHAR(100) NOT NULL,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(source_entity_id, target_entity_id, relation_type)
            )
        `);

        // Create indexes
        console.log('📋 Creating indexes...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_entity_types_name ON entity_types(name)',
            'CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type_id)',
            'CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status)',
            'CREATE INDEX IF NOT EXISTS idx_entity_attrs_entity ON entity_attributes(entity_id)',
            'CREATE INDEX IF NOT EXISTS idx_entity_attrs_name ON entity_attributes(attribute_name)',
            'CREATE INDEX IF NOT EXISTS idx_entity_relations_source ON entity_relations(source_entity_id)',
            'CREATE INDEX IF NOT EXISTS idx_entity_relations_target ON entity_relations(target_entity_id)'
        ];
        for (const idx of indexes) {
            await client.query(idx);
        }

        // Seed default entity types
        console.log('📋 Seeding entity types...');
        const entityTypes = [
            { name: 'circle', display_name: 'Circle', description: 'Group or family circle', icon: 'users' },
            { name: 'house_type', display_name: 'House Type', description: 'Category for circles/houses', icon: 'home' },
            { name: 'social_post', display_name: 'Social Post', description: 'User-generated social content', icon: 'message-square' },
            { name: 'note', display_name: 'Note', description: 'User notes and memos', icon: 'file-text' },
            { name: 'todo', display_name: 'Todo', description: 'Tasks and to-do items', icon: 'check-square' },
            { name: 'calendar_event', display_name: 'Calendar Event', description: 'Scheduled events', icon: 'calendar' }
        ];

        for (const type of entityTypes) {
            await client.query(`
                INSERT INTO entity_types (name, display_name, description, icon, is_system)
                VALUES ($1, $2, $3, $4, true)
                ON CONFLICT (name) DO UPDATE SET
                    display_name = EXCLUDED.display_name,
                    description = EXCLUDED.description,
                    icon = EXCLUDED.icon,
                    updated_at = NOW()
            `, [type.name, type.display_name, type.description, type.icon]);
        }

        // Create helper function
        console.log('📋 Creating helper function...');
        await client.query(`
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
            $$ LANGUAGE plpgsql
        `);

        // Create admin_user_preferences table for view mode storage
        console.log('📋 Creating admin_user_preferences table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_user_preferences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                preference_key VARCHAR(255) NOT NULL,
                preference_value JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, preference_key)
            )
        `);
        await client.query('CREATE INDEX IF NOT EXISTS idx_preferences_user ON admin_user_preferences(user_id)');

        console.log('🎉 EAV Schema Migration completed successfully!');

        // Verify tables exist
        const { rows } = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('entity_types', 'entities', 'entity_attributes', 'entity_relations', 'admin_user_preferences')
            ORDER BY table_name
        `);
        console.log('\n✅ Tables created:', rows.map(r => r.table_name).join(', '));

        // Check entity types
        const { rows: types } = await client.query(`SELECT name, display_name FROM entity_types ORDER BY name`);
        console.log('\n📦 Entity Types:');
        types.forEach(t => console.log(`   - ${t.name} (${t.display_name})`));

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
