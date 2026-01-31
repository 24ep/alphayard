/**
 * MCP Server Implementation
 * Model Context Protocol server for AI-assisted mobile app development
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database';
import entityService from '../services/EntityService';

// Store active transports for session management
const activeTransports = new Map<string, SSEServerTransport>();

// Define schemas separately to avoid TS2589 (excessive type instantiation depth)
const ListUsersSchema = {
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional()
};

const GetUserSchema = {
  userId: z.string()
};

const SearchUsersSchema = {
  query: z.string(),
  limit: z.number().optional()
};

const PaginationSchema = {
  page: z.number().optional(),
  limit: z.number().optional()
};

const CircleIdSchema = {
  circleId: z.string()
};

const AppConfigSchema = {};

const CircleTypesSchema = {};

const ListConversationsSchema = {
  userId: z.string().optional(),
  limit: z.number().optional()
};

const GetMessagesSchema = {
  conversationId: z.string(),
  limit: z.number().optional()
};

// --- Dynamic Collection Schemas ---

const ListCollectionsSchema = {
  applicationId: z.string().optional()
};

const GetCollectionSchemaDetails = {
  typeName: z.string()
};

const ListCollectionItemsSchema = {
  typeName: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['asc', 'desc']).optional(),
  applicationId: z.string().optional()
};

const GetCollectionItemSchema = {
  typeName: z.string(), // Included for API consistency, though ID is unique
  id: z.string()
};

const CreateCollectionItemSchema = {
  typeName: z.string(),
  applicationId: z.string().optional(),
  attributes: z.record(z.any()), // Dynamic attributes
  metadata: z.record(z.any()).optional()
};

const UpdateCollectionItemSchema = {
  id: z.string(),
  attributes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  status: z.string().optional()
};

const DeleteCollectionItemSchema = {
  id: z.string(),
  hard: z.boolean().optional()
};

/**
 * Create and configure the MCP server with all tools and resources
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'boundary-admin-mcp',
    version: '1.0.0'
  });

  // Helper to create tool result
  const success = (data: any) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }]
  });
  
  const error = (msg: string) => ({
    content: [{ type: 'text' as const, text: `Error: ${msg}` }],
    isError: true
  });

  // ====== USER MANAGEMENT TOOLS ======
  
  server.tool(
    'list_users',
    'List users with optional pagination and filters',
    ListUsersSchema as any,
    async (args: any) => {
      try {
        const { page = 1, limit = 20, search } = args;
        const offset = (page - 1) * limit;

        let query = `SELECT id, email, first_name as "firstName", last_name as "lastName",
                     avatar_url as "avatarUrl", created_at as "createdAt"
                     FROM users WHERE 1=1`;
        const params: any[] = [];
        let pi = 1;

        if (search) {
          query += ` AND (email ILIKE $${pi} OR first_name ILIKE $${pi} OR last_name ILIKE $${pi})`;
          params.push(`%${search}%`);
          pi++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${pi} OFFSET $${pi + 1}`;
        params.push(Math.min(limit, 100), offset);

        const result = await pool.query(query, params);
        return success({ users: result.rows, pagination: { page, limit } });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'get_user',
    'Get a user by their ID',
    GetUserSchema as any,
    async (args: any) => {
      try {
        const result = await pool.query(
          `SELECT id, email, first_name as "firstName", last_name as "lastName",
                  avatar_url as "avatarUrl", created_at as "createdAt"
           FROM users WHERE id = $1`, [args.userId]
        );
        if (result.rows.length === 0) return error(`User not found: ${args.userId}`);
        return success(result.rows[0]);
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'search_users',
    'Search for users by name or email',
    SearchUsersSchema as any,
    async (args: any) => {
      try {
        const result = await pool.query(
          `SELECT id, email, first_name as "firstName", last_name as "lastName"
           FROM users WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1
           ORDER BY first_name LIMIT $2`,
          [`%${args.query}%`, Math.min(args.limit || 20, 50)]
        );
        return success({ users: result.rows, count: result.rows.length });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  // ====== CIRCLE TOOLS ======

  server.tool(
    'list_circles',
    'List circles/groups',
    PaginationSchema as any,
    async (args: any) => {
      try {
        const { page = 1, limit = 20 } = args;
        const offset = (page - 1) * limit;
        const result = await pool.query(
          `SELECT c.id, c.name, c.description, c.created_at as "createdAt",
                  (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.id) as "memberCount"
           FROM circles c ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
          [Math.min(limit, 100), offset]
        );
        return success({ circles: result.rows, pagination: { page, limit } });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'get_circle',
    'Get a circle by ID',
    CircleIdSchema as any,
    async (args: any) => {
      try {
        const result = await pool.query(
          `SELECT id, name, description, created_at as "createdAt"
           FROM circles WHERE id = $1`, [args.circleId]
        );
        if (result.rows.length === 0) return error(`Circle not found: ${args.circleId}`);
        return success(result.rows[0]);
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  // ====== CONFIG TOOLS ======

  server.tool(
    'get_app_config',
    'Get application configuration',
    AppConfigSchema as any,
    async () => {
      try {
        const result = await pool.query(
          `SELECT id, name, display_name as "displayName", description, features, settings
           FROM applications LIMIT 1`
        );
        if (result.rows.length === 0) return error('No app config found');
        return success(result.rows[0]);
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'get_circle_types',
    'Get available circle types',
    CircleTypesSchema as any,
    async () => {
      try {
        const result = await pool.query(
          `SELECT id, name, description, icon, color FROM circle_types 
           WHERE is_active = true ORDER BY sort_order ASC`
        );
        return success({ circleTypes: result.rows });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  // ====== CHAT TOOLS ======

  server.tool(
    'list_conversations',
    'List chat conversations',
    ListConversationsSchema as any,
    async (args: any) => {
      try {
        const { userId, limit = 20 } = args;
        let query = `SELECT id, type, name, updated_at as "updatedAt" FROM chat_conversations`;
        const params: any[] = [];

        if (userId) {
          query += ` WHERE id IN (SELECT conversation_id FROM chat_participants WHERE user_id = $1)`;
          params.push(userId);
        }

        query += ` ORDER BY updated_at DESC LIMIT $${params.length + 1}`;
        params.push(Math.min(limit, 50));

        const result = await pool.query(query, params);
        return success({ conversations: result.rows });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'get_messages',
    'Get messages in a conversation',
    GetMessagesSchema as any,
    async (args: any) => {
      try {
        const result = await pool.query(
          `SELECT id, sender_id as "senderId", content, created_at as "createdAt"
           FROM chat_messages WHERE conversation_id = $1
           ORDER BY created_at DESC LIMIT $2`,
          [args.conversationId, Math.min(args.limit || 50, 100)]
        );
        return success({ messages: result.rows.reverse() });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  // ====== DYNAMIC COLLECTION TOOLS ======

  server.tool(
    'list_collections',
    'List all available dynamic collections (entity types)',
    ListCollectionsSchema as any,
    async (args: any) => {
      try {
        const { applicationId } = args;
        const types = await entityService.listEntityTypes(applicationId);
        return success({ 
          collections: types.map(t => ({
            id: t.id,
            name: t.name,
            displayName: t.displayName,
            description: t.description,
            isSystem: t.isSystem,
            icon: t.icon
          })) 
        });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'get_collection_schema',
    'Get the schema definition for a specific collection',
    GetCollectionSchemaDetails as any,
    async (args: any) => {
      try {
        const { typeName } = args;
        const entityType = await entityService.getEntityType(typeName);
        if (!entityType) return error(`Collection '${typeName}' not found`);
        return success({ schema: entityType });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'list_collection_items',
    'List items in a collection with filtering',
    ListCollectionItemsSchema as any,
    async (args: any) => {
      try {
        const { typeName, page, limit, search, orderBy, orderDir, applicationId } = args;
        
        let result;
        if (search) {
          const items = await entityService.searchEntities(typeName, search, {
            applicationId,
            limit
          });
          result = { items, total: items.length };
        } else {
          result = await entityService.queryEntities(typeName, {
            applicationId,
            page,
            limit,
            orderBy,
            orderDir
          });
        }
        
        return success(result);
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'get_collection_item',
    'Get a specific item from a collection',
    GetCollectionItemSchema as any,
    async (args: any) => {
      try {
        const { id } = args;
        const item = await entityService.getEntity(id);
        if (!item) return error(`Item not found: ${id}`);
        return success(item);
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'create_collection_item',
    'Create a new item in a collection',
    CreateCollectionItemSchema as any,
    async (args: any) => {
      try {
        const item = await entityService.createEntity(args);
        return success(item);
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'update_collection_item',
    'Update an existing item in a collection',
    UpdateCollectionItemSchema as any,
    async (args: any) => {
      try {
        const { id, ...updates } = args;
        const item = await entityService.updateEntity(id, updates);
        return success(item);
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  server.tool(
    'delete_collection_item',
    'Delete an item from a collection',
    DeleteCollectionItemSchema as any,
    async (args: any) => {
      try {
        const result = await entityService.deleteEntity(args.id, args.hard);
        return success({ success: result });
      } catch (e) {
        return error((e as Error).message);
      }
    }
  );

  console.log('[MCP] Server created with 16 tools');
  return server;
}

/**
 * Create Express router for MCP endpoints
 */
export function createMcpRouter(): Router {
  const router = Router();
  const mcpApiKey = process.env.MCP_API_KEY || 'default-mcp-key-change-in-production';

  // API Key authentication
  const auth = (req: Request, res: Response, next: Function) => {
    const key = req.headers['x-mcp-api-key'] || req.query.apiKey;
    if (!key || key !== mcpApiKey) {
      return res.status(401).json({ error: 'Invalid MCP API key' });
    }
    next();
  };

  // SSE endpoint
  router.get('/sse', auth, async (req: Request, res: Response) => {
    console.log('[MCP] SSE connection requested');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sessionId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const transport = new SSEServerTransport('/api/mcp/messages', res);
    activeTransports.set(sessionId, transport);

    const server = createMcpServer();
    
    try {
      await transport.start();
      await server.connect(transport);
      console.log(`[MCP] Connected: ${sessionId}`);
    } catch (e) {
      console.error('[MCP] Connection error:', e);
    }

    req.on('close', () => {
      activeTransports.delete(sessionId);
      server.close();
    });
  });

  // Message endpoint
  router.post('/messages', auth, async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = activeTransports.get(sessionId);
    if (!transport) return res.status(404).json({ error: 'Session not found' });

    try {
      await transport.handlePostMessage(req, res);
    } catch (e) {
      res.status(500).json({ error: 'Internal error' });
    }
  });

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'boundary-mcp', sessions: activeTransports.size });
  });

  // List tools
  router.get('/tools', auth, (_req, res) => {
    res.json({
      tools: [
        'list_users', 'get_user', 'search_users',
        'list_circles', 'get_circle',
        'get_app_config', 'get_circle_types',
        'list_conversations', 'get_messages',
        'list_collections', 'get_collection_schema', 'list_collection_items',
        'get_collection_item', 'create_collection_item', 'update_collection_item', 'delete_collection_item'
      ]
    });
  });

  console.log('[MCP] Router ready');
  return router;
}

export { McpServer };
