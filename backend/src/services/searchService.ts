import { pool } from '../config/database';

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  relevance: number;
  createdAt?: Date;
  [key: string]: any;
}

export interface SearchOptions {
  type?: string;
  limit?: number;
  skip?: number;
  userId?: string | null;
}

export interface SearchResponse {
  query: string;
  type: string;
  results: {
    combined?: SearchResult[];
    users?: SearchResult[];
    families?: SearchResult[];
    messages?: SearchResult[];
    alerts?: SearchResult[];
    safetyChecks?: SearchResult[];
  };
  total: number;
  limit: number;
  skip: number;
}

export interface SearchSuggestion {
  type: string;
  text: string;
  value: string;
}

class SearchService {
  public searchTypes = {
    USERS: 'users',
    FAMILIES: 'families',
    MESSAGES: 'messages',
    ALERTS: 'alerts',
    SAFETY_CHECKS: 'safety_checks',
    ALL: 'all',
  };

  public searchFields = {
    users: ['first_name', 'last_name', 'email', "metadata->>'displayName'", "metadata->>'bio'"],
    circles: ['name', 'description'],
    messages: ['content'],
    alerts: ['message', 'type'],
    safety_checks: ['message'],
  };

  constructor() {}

  // Main search function
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      const {
        type = this.searchTypes.ALL,
        limit = 20,
        skip = 0,
        userId = null,
      } = options;

      let results: any = {};

      if (type === this.searchTypes.ALL || type === this.searchTypes.USERS) {
        results.users = await this.searchUsers(query, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.FAMILIES) {
        results.families = await this.searchFamilies(query, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.MESSAGES) {
        results.messages = await this.searchMessages(query, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.ALERTS) {
        results.alerts = await this.searchAlerts(query, limit, skip);
      }

      if (type === this.searchTypes.ALL || type === this.searchTypes.SAFETY_CHECKS) {
        results.safetyChecks = await this.searchSafetyChecks(query, limit, skip);
      }

      // Combine and rank results if searching all types
      if (type === this.searchTypes.ALL) {
        results = this.combineAndRankResults(results, query);
      }

      return {
        query,
        type,
        results,
        total: this.getTotalCount(results),
        limit,
        skip,
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Placeholder for compatibility
  async buildSearchQuery(query: string, type: string, filters: any, userId: string | null) {
    return { query };
  }

  buildSortOptions(sortBy: string, sortOrder: string) {
    return {};
  }

  // Search users
  async searchUsers(query: string, limit: number, skip: number): Promise<SearchResult[]> {
    try {
      const { rows: users } = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, 
               u.metadata->>'bio' as bio,
               u.created_at,
               c.name as circle_name
        FROM users u
        LEFT JOIN circle_members cm ON u.id = cm.user_id AND cm.role = 'admin'
        LEFT JOIN circles c ON cm.circle_id = c.id
        WHERE (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1 OR u.metadata->>'displayName' ILIKE $1)
        AND u.is_active = true
        LIMIT $2 OFFSET $3
      `, [`%${query}%`, limit, skip]);

      return users.map(user => ({
        type: 'user',
        id: user.id,
        title: `${user.first_name} ${user.last_name}`,
        subtitle: user.email,
        description: user.bio || '',
        avatar: user.avatar_url,
        circle: user.circle_name,
        relevance: 10, // Placeholder
        createdAt: user.created_at,
      }));
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  }

  // Search families (circles)
  async searchFamilies(query: string, limit: number, skip: number): Promise<SearchResult[]> {
    try {
      const { rows: families } = await pool.query(`
        SELECT f.*, 
               u.first_name || ' ' || u.last_name as admin_name,
               (SELECT COUNT(*) FROM circle_members WHERE circle_id = f.id) as member_count
        FROM circles f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE (f.name ILIKE $1 OR f.description ILIKE $1)
        LIMIT $2 OFFSET $3
      `, [`%${query}%`, limit, skip]);

      return families.map(circle => ({
        type: 'circle',
        id: circle.id,
        title: circle.name,
        subtitle: `${circle.member_count} members`,
        description: circle.description || '',
        admin: circle.admin_name,
        memberCount: parseInt(circle.member_count),
        privacy: circle.settings?.privacy,
        relevance: 10, // Placeholder
        createdAt: circle.created_at,
      }));
    } catch (error) {
      console.error('Search families error:', error);
      return [];
    }
  }

  // Search messages
  async searchMessages(query: string, limit: number, skip: number): Promise<SearchResult[]> {
    try {
      const { rows: messages } = await pool.query(`
        SELECT m.*, 
               u.first_name, u.last_name, u.avatar_url,
               r.name as room_name
        FROM chat_messages m
        JOIN users u ON m.user_id = u.id
        JOIN chat_rooms r ON m.room_id = r.id
        WHERE m.content ILIKE $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
      `, [`%${query}%`, limit, skip]);

      return messages.map(message => ({
        type: 'message',
        id: message.id,
        title: message.content.substring(0, 100),
        subtitle: `From ${message.first_name} ${message.last_name}`,
        description: message.content,
        sender: {
          id: message.user_id,
          firstName: message.first_name,
          lastName: message.last_name,
          avatar: message.avatar_url
        },
        chat: {
          id: message.room_id,
          name: message.room_name
        },
        messageType: 'text',
        relevance: 10,
        createdAt: message.created_at,
      }));
    } catch (error) {
      console.error('Search messages error:', error);
      return [];
    }
  }

  // Search alerts
  async searchAlerts(query: string, limit: number, skip: number): Promise<SearchResult[]> {
    try {
      const { rows: alerts } = await pool.query(`
        SELECT sa.*, 
               u.first_name, u.last_name,
               c.name as circle_name
        FROM safety_alerts sa
        JOIN users u ON sa.user_id = u.id
        LEFT JOIN circles c ON sa.family_id = c.id
        WHERE sa.message ILIKE $1 OR sa.type ILIKE $1
        ORDER BY sa.created_at DESC
        LIMIT $2 OFFSET $3
      `, [`%${query}%`, limit, skip]);

      return alerts.map(alert => ({
        type: 'alert',
        id: alert.id,
        title: `${alert.type} Alert`,
        subtitle: `From ${alert.first_name} ${alert.last_name}`,
        description: alert.message || '',
        alertType: alert.type,
        status: alert.is_acknowledged ? 'acknowledged' : 'active',
        user: {
          id: alert.user_id,
          firstName: alert.first_name,
          lastName: alert.last_name
        },
        circle: {
          id: alert.family_id,
          name: alert.circle_name
        },
        relevance: 10,
        createdAt: alert.created_at,
      }));
    } catch (error) {
      console.error('Search alerts error:', error);
      return [];
    }
  }

  // Search safety checks
  async searchSafetyChecks(query: string, limit: number, skip: number): Promise<SearchResult[]> {
    try {
      const { rows: checks } = await pool.query(`
        SELECT sc.*, 
               u.first_name, u.last_name,
               rb.first_name as rb_first_name, rb.last_name as rb_last_name,
               c.name as circle_name
        FROM safety_checks sc
        JOIN users u ON sc.user_id = u.id
        LEFT JOIN users rb ON sc.requested_by = rb.id
        LEFT JOIN circles c ON sc.family_id = c.id
        WHERE sc.message ILIKE $1
        ORDER BY sc.created_at DESC
        LIMIT $2 OFFSET $3
      `, [`%${query}%`, limit, skip]);

      return checks.map(check => ({
        type: 'safety_check',
        id: check.id,
        title: 'Safety Check',
        subtitle: `Requested by ${check.rb_first_name || 'System'} ${check.rb_last_name || ''}`,
        description: check.message || '',
        status: check.status,
        user: {
          id: check.user_id,
          firstName: check.first_name,
          lastName: check.last_name
        },
        requestedBy: {
          id: check.requested_by,
          firstName: check.rb_first_name,
          lastName: check.rb_last_name
        },
        circle: {
          id: check.family_id,
          name: check.circle_name
        },
        relevance: 10,
        createdAt: check.created_at,
      }));
    } catch (error) {
      console.error('Search safety checks error:', error);
      return [];
    }
  }

  // Combine and rank results
  combineAndRankResults(results: any, query: string) {
    const allResults: SearchResult[] = [];

    // Add users
    if (results.users) {
      allResults.push(...results.users);
    }

    // Add families
    if (results.families) {
      allResults.push(...results.families);
    }

    // Add messages
    if (results.messages) {
      allResults.push(...results.messages);
    }

    // Add alerts
    if (results.alerts) {
      allResults.push(...results.alerts);
    }

    // Add safety checks
    if (results.safetyChecks) {
      allResults.push(...results.safetyChecks);
    }

    // Sort by relevance
    allResults.sort((a, b) => b.relevance - a.relevance);

    return {
      combined: allResults,
      users: results.users || [],
      families: results.families || [],
      messages: results.messages || [],
      alerts: results.alerts || [],
      safetyChecks: results.safetyChecks || [],
    };
  }

  // Calculate relevance score
  calculateRelevance(item: SearchResult, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Check exact matches
    if (item.title && item.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    if (item.subtitle && item.subtitle.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    if (item.description && item.description.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    // Check partial matches
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (item.title && item.title.toLowerCase().includes(word)) {
        score += 2;
      }
      if (item.subtitle && item.subtitle.toLowerCase().includes(word)) {
        score += 1;
      }
    });

    // Boost recent items
    if (item.createdAt) {
      const daysSinceCreation = (Date.now() - (item.createdAt as any).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        score += 1;
      }
    }

    return score;
  }

  // Get total count
  getTotalCount(results: any): number {
    let total = 0;

    if (results.combined) {
      total = results.combined.length;
    } else {
      if (results.users) total += results.users.length;
      if (results.families) total += results.families.length;
      if (results.messages) total += results.messages.length;
      if (results.alerts) total += results.alerts.length;
      if (results.safetyChecks) total += results.safetyChecks.length;
    }

    return total;
  }

  // Get user circles for filtering
  async getUserFamilies(userId: string): Promise<string[]> {
    try {
      const { rows } = await pool.query(
        "SELECT circle_id FROM circle_members WHERE user_id = $1",
        [userId]
      );
      return rows.map(r => r.circle_id);
    } catch (error) {
      console.error('Get user circles error:', error);
      return [];
    }
  }

  // Advanced search with filters - simplified to basic search for now
  async advancedSearch(query: string, filters: any = {}): Promise<SearchResponse> {
    return this.search(query, { type: filters.type, limit: filters.limit, skip: filters.skip });
  }

  // Search suggestions
  async getSearchSuggestions(query: string, type: string = 'all'): Promise<SearchSuggestion[]> {
    try {
      const suggestions: SearchSuggestion[] = [];

      if (type === 'all' || type === 'users') {
        const { rows: users } = await pool.query(`
          SELECT id, first_name, last_name, email 
          FROM users 
          WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
          AND is_active = true
          LIMIT 5
        `, [`%${query}%`]);

        suggestions.push(...users.map(user => ({
          type: 'user',
          text: `${user.first_name} ${user.last_name}`,
          value: user.id,
        })));
      }

      if (type === 'all' || type === 'families') {
        const { rows: families } = await pool.query(`
          SELECT id, name 
          FROM circles 
          WHERE name ILIKE $1
          LIMIT 5
        `, [`%${query}%`]);

        suggestions.push(...families.map(circle => ({
          type: 'circle',
          text: circle.name,
          value: circle.id,
        })));
      }

      return suggestions;
    } catch (error) {
      console.error('Get search suggestions error:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
export default searchService;
