// Shopping Service - STUBBED (shoppingListItem table not in current schema)
// TODO: Add shopping_list_items table to Prisma schema to enable this feature

class ShoppingService {
    /**
     * List shopping items for a user, optionally filtered by circle
     */
    async list(_ownerId: string, _circleId?: string) {
        // Table not available in schema
        return {
            entities: [],
            total: 0,
        };
    }

    /**
     * Create a new shopping item
     */
    async create(_data: any) {
        throw new Error('Shopping feature not available - table not configured');
    }

    /**
     * Update a shopping item
     */
    async update(_id: string, _attributes: any) {
        throw new Error('Shopping feature not available - table not configured');
    }

    /**
     * Delete a shopping item
     */
    async delete(_id: string) {
        throw new Error('Shopping feature not available - table not configured');
    }
}

export default new ShoppingService();
