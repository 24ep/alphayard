import { query } from '../config/database';
import { FinancialAccount, FinancialTransaction, FinancialCategory, FinancialBudget, FinancialGoal } from '../models/Financial';

class FinanceService {
    /**
     * Get all accounts for a user
     */
    async getAccounts(userId: string): Promise<FinancialAccount[]> {
        const { rows } = await query(`
            SELECT * FROM financial_accounts 
            WHERE user_id = $1 
            ORDER BY created_at ASC
        `, [userId]);
        return rows;
    }

    /**
     * Create a new account
     */
    async createAccount(accountData: Partial<FinancialAccount>): Promise<FinancialAccount> {
        // Extract fields to ensure safe insert
        const { user_id, name, type, balance, currency, color, is_included_in_net_worth } = accountData;
        const { rows } = await query(`
            INSERT INTO financial_accounts (user_id, name, type, balance, currency, color, is_included_in_net_worth, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *
        `, [user_id, name, type, balance, currency, color, is_included_in_net_worth || true]);
        return rows[0];
    }

    /**
     * Update an account
     */
    async updateAccount(accountId: string, updates: Partial<FinancialAccount>): Promise<FinancialAccount> {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id' && key !== 'created_at' && key !== 'user_id') {
                fields.push(`${key} = $${idx++}`);
                values.push(value);
            }
        }

        if (fields.length === 0) throw new Error('No updates provided');

        fields.push(`updated_at = NOW()`);
        values.push(accountId);

        const { rows } = await query(`
            UPDATE financial_accounts 
            SET ${fields.join(', ')} 
            WHERE id = $${idx} 
            RETURNING *
        `, values);

        return rows[0];
    }

    /**
     * Delete an account
     */
    async deleteAccount(accountId: string): Promise<boolean> {
        await query('DELETE FROM financial_accounts WHERE id = $1', [accountId]);
        return true;
    }

    /**
     * Get transactions
     */
    async getTransactions(userId: string, filters: any = {}): Promise<FinancialTransaction[]> {
        let sql = `
            SELECT 
                ft.*,
                fc.id as cat_id, fc.name as cat_name, fc.icon as cat_icon, fc.color as cat_color, fc.type as cat_type,
                fa.id as acc_id, fa.name as acc_name, fa.type as acc_type, fa.color as acc_color
            FROM financial_transactions ft
            LEFT JOIN financial_categories fc ON ft.category_id = fc.id
            LEFT JOIN financial_accounts fa ON ft.account_id = fa.id
            WHERE ft.user_id = $1
        `;
        const values: any[] = [userId];
        let idx = 2;

        if (filters.limit) {
            sql += ` ORDER BY ft.date DESC LIMIT $${idx++}`;
            values.push(filters.limit);
        } else {
            sql += ` ORDER BY ft.date DESC`;
        }

        const { rows } = await query(sql, values);

        return rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            account_id: row.account_id,
            category_id: row.category_id,
            amount: row.amount,
            type: row.type,
            date: row.date,
            note: row.note || row.description, // Handle potential DB drift, logic says note
            is_family_shared: row.is_family_shared || false,
            location_label: row.location_label,
            created_at: row.created_at,
            updated_at: row.updated_at,
            category: row.cat_id ? {
                id: row.cat_id,
                name: row.cat_name,
                icon: row.cat_icon,
                color: row.cat_color,
                type: row.cat_type
            } : undefined,
            account: row.acc_id ? {
                id: row.acc_id,
                name: row.acc_name,
                type: row.acc_type,
                color: row.acc_color
            } : undefined
        } as FinancialTransaction));
    }

    /**
     * Create transaction and update account balance
     */
    async createTransaction(txData: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
        const { user_id, account_id, category_id, amount, type, date, note, is_family_shared, location_label } = txData;

        const { rows } = await query(`
            INSERT INTO financial_transactions (user_id, account_id, category_id, amount, type, date, note, is_family_shared, location_label, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *
        `, [user_id, account_id, category_id, amount, type, date, note, is_family_shared || false, location_label]);

        const transaction = rows[0];

        // Update account balance
        if (transaction && account_id) {
            await this.updateAccountBalance(account_id, Number(amount || 0), type as any);
        }

        return transaction;
    }

    async updateAccountBalance(accountId: string, amount: number, type: 'income' | 'expense' | 'transfer') {
        let delta = 0;
        if (type === 'income') delta = amount;
        if (type === 'expense') delta = -amount;

        // Atomic update
        await query(`
            UPDATE financial_accounts 
            SET balance = balance + $1, updated_at = NOW() 
            WHERE id = $2
        `, [delta, accountId]);
    }

    /**
     * Get Categories
     */
    async getCategories(): Promise<FinancialCategory[]> {
        const { rows } = await query(`
            SELECT * FROM financial_categories 
            ORDER BY type ASC
        `);
        return rows;
    }

    /**
    * Get Goals
    */
    async getGoals(userId: string): Promise<FinancialGoal[]> {
        const { rows } = await query(`
            SELECT * FROM financial_goals 
            WHERE user_id = $1
        `, [userId]);
        return rows;
    }

    async createGoal(goalData: Partial<FinancialGoal>): Promise<FinancialGoal> {
        const { user_id, name, target_amount, current_amount, target_date, color } = goalData;
        const { rows } = await query(`
            INSERT INTO financial_goals (user_id, name, target_amount, current_amount, target_date, color, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `, [user_id, name, target_amount, current_amount || 0, target_date, color]);
        return rows[0];
    }
}

export default new FinanceService();
