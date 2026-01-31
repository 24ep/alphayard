import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import {
    Entity,
    EntityAttribute,
    CreateEntityInput,
    UpdateEntityInput,
    EntityQueryOptions,
    FieldDefinition,
    EntityTypeSchema,
    EntityType,
    CreateEntityTypeInput,
    UpdateEntityTypeInput
} from '@bondarys/shared';

/**
 * Entity-Attribute-Value (EAV) Service
 * Provides flexible, schema-less data storage for collections
 */

class EntityService {
    
    /**
     * Get entity type by name
     */
    async getEntityType(typeName: string): Promise<{ id: string; name: string; schema: any } | null> {
        const { rows } = await pool.query(
            `SELECT id, name, display_name, schema FROM entity_types WHERE name = $1`,
            [typeName]
        );
        return rows[0] || null;
    }

    /**
     * List all entity types
     */
    async listEntityTypes(applicationId?: string): Promise<EntityType[]> {
        let query = `SELECT * FROM entity_types WHERE 1=1`;
        const params: any[] = [];
        
        if (applicationId) {
            params.push(applicationId);
            query += ` AND (application_id = $${params.length} OR application_id IS NULL)`;
        }
        
        query += ` ORDER BY is_system DESC, display_name`;
        
        const { rows } = await pool.query(query, params);
        return rows.map(this.mapRowToEntityType);
    }

    /**
     * Get entity type by ID
     */
    async getEntityTypeById(id: string): Promise<EntityType | null> {
        const { rows } = await pool.query(
            `SELECT * FROM entity_types WHERE id = $1`,
            [id]
        );
        if (!rows[0]) return null;
        return this.mapRowToEntityType(rows[0]);
    }

    /**
     * Create a new entity type (collection schema)
     */
    async createEntityType(input: CreateEntityTypeInput): Promise<EntityType> {
        // Validate name format (snake_case, no spaces)
        if (!/^[a-z][a-z0-9_]*$/.test(input.name)) {
            throw new Error('Entity type name must be lowercase, start with a letter, and contain only letters, numbers, and underscores');
        }

        // Check if name already exists
        const existing = await this.getEntityType(input.name);
        if (existing) {
            throw new Error(`Entity type '${input.name}' already exists`);
        }

        const schema = input.schema || { fields: [] };
        
        const { rows } = await pool.query(
            `INSERT INTO entity_types (name, display_name, description, application_id, schema, icon, is_system)
             VALUES ($1, $2, $3, $4, $5, $6, false)
             RETURNING *`,
            [
                input.name,
                input.displayName,
                input.description || null,
                input.applicationId || null,
                JSON.stringify(schema),
                input.icon || 'collection'
            ]
        );

        return this.mapRowToEntityType(rows[0]);
    }

    /**
     * Update an entity type (collection schema)
     */
    async updateEntityType(id: string, input: UpdateEntityTypeInput): Promise<EntityType | null> {
        // Get current entity type
        const current = await this.getEntityTypeById(id);
        if (!current) {
            return null;
        }

        // Cannot modify system entity types schema (but can update display fields)
        if (current.isSystem && input.schema) {
            throw new Error('Cannot modify schema of system entity types');
        }

        const updates: string[] = ['updated_at = NOW()'];
        const values: any[] = [];
        let paramIndex = 1;

        if (input.displayName !== undefined) {
            updates.push(`display_name = $${paramIndex++}`);
            values.push(input.displayName);
        }
        if (input.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(input.description);
        }
        if (input.schema !== undefined) {
            updates.push(`schema = $${paramIndex++}`);
            values.push(JSON.stringify(input.schema));
        }
        if (input.icon !== undefined) {
            updates.push(`icon = $${paramIndex++}`);
            values.push(input.icon);
        }

        values.push(id);

        const { rows } = await pool.query(
            `UPDATE entity_types SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        return rows[0] ? this.mapRowToEntityType(rows[0]) : null;
    }

    /**
     * Delete an entity type (non-system only)
     */
    async deleteEntityType(id: string): Promise<boolean> {
        // Check if it's a system type
        const entityType = await this.getEntityTypeById(id);
        if (!entityType) {
            return false;
        }
        if (entityType.isSystem) {
            throw new Error('Cannot delete system entity types');
        }

        // Delete the entity type (cascade will delete entities and attributes)
        const { rowCount } = await pool.query(
            `DELETE FROM entity_types WHERE id = $1 AND is_system = false`,
            [id]
        );

        return (rowCount ?? 0) > 0;
    }

    /**
     * Map database row to EntityType object
     */
    private mapRowToEntityType(row: any): EntityType {
        return {
            id: row.id,
            name: row.name,
            displayName: row.display_name,
            description: row.description,
            applicationId: row.application_id,
            schema: typeof row.schema === 'string' ? JSON.parse(row.schema) : (row.schema || { fields: [] }),
            icon: row.icon,
            isSystem: row.is_system,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

    /**
     * Create a new entity with attributes
     */
    async createEntity(input: CreateEntityInput): Promise<Entity> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get entity type
            const entityType = await this.getEntityType(input.typeName);
            if (!entityType) {
                throw new Error(`Entity type '${input.typeName}' not found`);
            }

            // Create entity
            const entityId = uuidv4();
            const { rows: [entity] } = await client.query(
                `INSERT INTO entities (id, entity_type_id, application_id, owner_id, metadata, status)
                 VALUES ($1, $2, $3, $4, $5, 'active')
                 RETURNING *`,
                [entityId, entityType.id, input.applicationId, input.ownerId, input.metadata || {}]
            );

            // Insert attributes
            for (const [name, value] of Object.entries(input.attributes)) {
                await this.insertAttribute(client, entityId, name, value);
            }

            await client.query('COMMIT');

            return this.getEntity(entityId) as Promise<Entity>;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Insert a single attribute value
     */
    private async insertAttribute(client: any, entityId: string, name: string, value: any): Promise<void> {
        const type = this.inferType(value);
        
        const columns: Record<string, string> = {
            text: 'value_text',
            number: 'value_number',
            boolean: 'value_boolean',
            json: 'value_json',
            date: 'value_date',
            datetime: 'value_datetime',
            reference: 'value_reference'
        };

        const column = columns[type] || 'value_text';
        const formattedValue = type === 'json' ? JSON.stringify(value) : value;

        await client.query(
            `INSERT INTO entity_attributes (entity_id, attribute_name, attribute_type, ${column})
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (entity_id, attribute_name) 
             DO UPDATE SET ${column} = $4, attribute_type = $3, updated_at = NOW()`,
            [entityId, name, type, formattedValue]
        );
    }

    /**
     * Infer attribute type from value
     */
    private inferType(value: any): string {
        if (value === null || value === undefined) return 'text';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (value instanceof Date) return 'datetime';
        if (typeof value === 'object') return 'json';
        if (typeof value === 'string') {
            // Check if it's a UUID (reference)
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
                return 'reference';
            }
            // Check if it's a date string
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
            if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return 'datetime';
        }
        return 'text';
    }

    /**
     * Get entity by ID with all attributes
     */
    async getEntity(id: string): Promise<Entity | null> {
        const { rows } = await pool.query(
            `SELECT get_entity_with_attributes($1) as entity`,
            [id]
        );

        if (!rows[0]?.entity) return null;

        const data = rows[0].entity;
        return {
            id: data.id,
            type: data.type,
            typeId: data.type_id,
            applicationId: data.application_id,
            ownerId: data.owner_id,
            status: data.status,
            metadata: data.metadata,
            attributes: data.attributes || {},
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    }

    /**
     * Update entity and attributes
     */
    async updateEntity(id: string, input: UpdateEntityInput): Promise<Entity | null> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update entity metadata/status if provided
            if (input.metadata || input.status) {
                const updates: string[] = ['updated_at = NOW()'];
                const values: any[] = [];
                let paramIndex = 1;

                if (input.metadata) {
                    updates.push(`metadata = metadata || $${paramIndex++}`);
                    values.push(JSON.stringify(input.metadata));
                }
                if (input.status) {
                    updates.push(`status = $${paramIndex++}`);
                    values.push(input.status);
                }

                values.push(id);
                await client.query(
                    `UPDATE entities SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
                    values
                );
            }

            // Update attributes
            if (input.attributes) {
                for (const [name, value] of Object.entries(input.attributes)) {
                    if (value === null) {
                        // Delete attribute
                        await client.query(
                            `DELETE FROM entity_attributes WHERE entity_id = $1 AND attribute_name = $2`,
                            [id, name]
                        );
                    } else {
                        await this.insertAttribute(client, id, name, value);
                    }
                }
            }

            await client.query('COMMIT');
            return this.getEntity(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Delete entity (soft delete by default)
     */
    async deleteEntity(id: string, hard: boolean = false): Promise<boolean> {
        if (hard) {
            const { rowCount } = await pool.query(
                `DELETE FROM entities WHERE id = $1`,
                [id]
            );
            return (rowCount ?? 0) > 0;
        } else {
            const { rowCount } = await pool.query(
                `UPDATE entities SET status = 'deleted', updated_at = NOW() WHERE id = $1`,
                [id]
            );
            return (rowCount ?? 0) > 0;
        }
    }

    /**
     * Query entities with filtering and pagination
     */
    async queryEntities(typeName: string, options: EntityQueryOptions = {}): Promise<{
        entities: Entity[];
        total: number;
        page: number;
        limit: number;
    }> {
        const entityType = await this.getEntityType(typeName);
        if (!entityType) {
            throw new Error(`Entity type '${typeName}' not found`);
        }

        const page = options.page || 1;
        const limit = Math.min(options.limit || 20, 100);
        const offset = (page - 1) * limit;

        // Build query
        let baseQuery = `FROM entities e WHERE e.entity_type_id = $1 AND e.status != 'deleted'`;
        const params: any[] = [entityType.id];
        let paramIndex = 2;

        if (options.applicationId) {
            baseQuery += ` AND e.application_id = $${paramIndex++}`;
            params.push(options.applicationId);
        }

        if (options.ownerId) {
            baseQuery += ` AND e.owner_id = $${paramIndex++}`;
            params.push(options.ownerId);
        }

        if (options.status) {
            baseQuery += ` AND e.status = $${paramIndex++}`;
            params.push(options.status);
        }

        // Count total
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) as total ${baseQuery}`,
            params
        );
        const total = parseInt(countRows[0].total, 10);

        // Get entities
        const orderBy = options.orderBy || 'created_at';
        const orderDir = options.orderDir || 'desc';
        
        const { rows } = await pool.query(
            `SELECT e.id ${baseQuery} ORDER BY e.${orderBy} ${orderDir} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, limit, offset]
        );

        // Fetch full entities
        const entities = await Promise.all(
            rows.map(row => this.getEntity(row.id))
        );

        return {
            entities: entities.filter(Boolean) as Entity[],
            total,
            page,
            limit
        };
    }

    /**
     * Search entities by attribute values
     */
    async searchEntities(typeName: string, searchTerm: string, options: EntityQueryOptions = {}): Promise<Entity[]> {
        const entityType = await this.getEntityType(typeName);
        if (!entityType) {
            throw new Error(`Entity type '${typeName}' not found`);
        }

        const limit = Math.min(options.limit || 20, 100);
        const searchPattern = `%${searchTerm.toLowerCase()}%`;

        const { rows } = await pool.query(
            `SELECT DISTINCT e.id
             FROM entities e
             JOIN entity_attributes ea ON ea.entity_id = e.id
             WHERE e.entity_type_id = $1 
               AND e.status != 'deleted'
               AND LOWER(ea.value_text) LIKE $2
             ORDER BY e.updated_at DESC
             LIMIT $3`,
            [entityType.id, searchPattern, limit]
        );

        const entities = await Promise.all(
            rows.map(row => this.getEntity(row.id))
        );

        return entities.filter(Boolean) as Entity[];
    }
}

export const entityService = new EntityService();
export default entityService;
