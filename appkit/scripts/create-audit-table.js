const { Client } = require('pg');

async function createAuditLogTable() {
  const connectionString = "postgresql://postgres:EiLTGaCpAAItsFeFGKayThIscerwWSEj@crossover.proxy.rlwy.net:23873/railway";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query('CREATE SCHEMA IF NOT EXISTS admin');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID,
        actor_type VARCHAR(50) NOT NULL,
        actor_id UUID,
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100),
        record_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS audit_logs_application_id_idx ON admin.audit_logs (application_id);
      CREATE INDEX IF NOT EXISTS audit_logs_actor_type_actor_id_idx ON admin.audit_logs (actor_type, actor_id);
      CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON admin.audit_logs (created_at);
    `;

    await client.query(createTableQuery);
    console.log('Table admin.audit_logs and indexes created successfully');

  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

createAuditLogTable();
