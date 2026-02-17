import entityService from './EntityService';
import { FinancialAccount, FinancialTransaction, FinancialGoal } from '../models/Financial';
import { prisma } from '../lib/prisma';

class FinanceService {
    // Accounts
    async getAccounts(userId: string) {
        return entityService.queryEntities('finance_account', {
            ownerId: userId,
            status: 'active'
        } as any);
    }

    async createAccount(data: any) {
        const { user_id, ...attributes } = data;
        return entityService.createEntity({
            typeName: 'finance_account',
            ownerId: user_id,
            attributes
        });
    }

    async updateAccount(id: string, attributes: any) {
        return entityService.updateEntity(id, { attributes });
    }

    async deleteAccount(id: string) {
        return entityService.deleteEntity(id);
    }

    // Transactions
    async getTransactions(userId: string, filters: any = {}) {
        return entityService.queryEntities('finance_transaction', {
            ownerId: userId,
            filters
        } as any);
    }

    async createTransaction(data: any) {
        const { user_id, ...attributes } = data;
        return entityService.createEntity({
            typeName: 'finance_transaction',
            ownerId: user_id,
            attributes
        });
    }

    // Categories (Can be entities or static defaults)
    async getCategories() {
        return entityService.queryEntities('finance_category', {
            status: 'active'
        } as any);
    }

    // Goals
    async getGoals(userId: string) {
        return entityService.queryEntities('finance_goal', {
            ownerId: userId
        } as any);
    }

    async createGoal(data: any) {
        const { user_id, ...attributes } = data;
        return entityService.createEntity({
            typeName: 'finance_goal',
            ownerId: user_id,
            attributes
        });
    }

    // Budgets
    async getBudgets(circleId: string) {
        return entityService.queryEntities('finance_budget', {
            applicationId: circleId,
            status: 'active'
        } as any);
    }

    async createBudget(data: any) {
        return entityService.createEntity({
            typeName: 'finance_budget',
            ownerId: data.ownerId,
            applicationId: data.circleId,
            attributes: data
        });
    }

    async updateBudget(id: string, attributes: any) {
        return entityService.updateEntity(id, { attributes });
    }

    async deleteBudget(id: string) {
        return entityService.deleteEntity(id);
    }

    // Stats & Reports - Real implementation
    async getExpenseStats(circleId: string, period: string = 'month') {
        try {
            // Determine date range based on period
            let intervalDays = 30;
            if (period === 'week') intervalDays = 7;
            else if (period === 'year') intervalDays = 365;
            else if (period === 'quarter') intervalDays = 90;

            // Total expenses in period
            const totalResult = await prisma.$queryRaw<Array<{ total: string }>>`
                SELECT COALESCE(SUM((attributes->>'amount')::numeric), 0) as total
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                AND created_at > NOW() - INTERVAL '1 day' * ${intervalDays}
                AND deleted_at IS NULL
            `;

            // Monthly average (based on last 6 months)
            const avgResult = await prisma.$queryRaw<Array<{ avg: string }>>`
                SELECT COALESCE(AVG(monthly_total), 0) as avg
                FROM (
                    SELECT DATE_TRUNC('month', created_at) as month,
                           SUM((attributes->>'amount')::numeric) as monthly_total
                    FROM entities
                    WHERE type_name = 'finance_transaction'
                    AND application_id = ${circleId}::uuid
                    AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                    AND created_at > NOW() - INTERVAL '6 months'
                    AND deleted_at IS NULL
                    GROUP BY DATE_TRUNC('month', created_at)
                ) monthly
            `;

            // Top category
            const topCatResult = await prisma.$queryRaw<Array<{ category: string | null; total: string }>>`
                SELECT attributes->>'category' as category,
                       SUM((attributes->>'amount')::numeric) as total
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                AND created_at > NOW() - INTERVAL '1 day' * ${intervalDays}
                AND deleted_at IS NULL
                GROUP BY attributes->>'category'
                ORDER BY total DESC
                LIMIT 1
            `;

            // Recent expenses (last 7 days)
            const recentResult = await prisma.$queryRaw<Array<{ total: string }>>`
                SELECT COALESCE(SUM((attributes->>'amount')::numeric), 0) as total
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                AND created_at > NOW() - INTERVAL '7 days'
                AND deleted_at IS NULL
            `;

            // Upcoming recurring
            const recurringResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
                SELECT COUNT(*)::bigint as count
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND attributes->>'isRecurring' = 'true'
                AND deleted_at IS NULL
            `;

            // Budget utilization
            const budgetResult = await prisma.$queryRaw<Array<{ budget: string }>>`
                SELECT COALESCE(SUM((attributes->>'amount')::numeric), 0) as budget
                FROM entities
                WHERE type_name = 'finance_budget'
                AND application_id = ${circleId}::uuid
                AND deleted_at IS NULL
            `;

            const totalExpenses = parseFloat(totalResult[0]?.total || '0');
            const totalBudget = parseFloat(budgetResult[0]?.budget || '0');

            return {
                totalExpenses,
                monthlyAverage: parseFloat(avgResult[0]?.avg || '0'),
                topCategory: topCatResult[0]?.category || 'Other',
                topCategoryAmount: parseFloat(topCatResult[0]?.total || '0'),
                recentExpenses: parseFloat(recentResult[0]?.total || '0'),
                upcomingRecurring: Number(recurringResult[0]?.count || 0),
                budgetUtilization: totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting expense stats:', error);
            return {
                totalExpenses: 0,
                monthlyAverage: 0,
                topCategory: 'Other',
                topCategoryAmount: 0,
                recentExpenses: 0,
                upcomingRecurring: 0,
                budgetUtilization: 0
            };
        }
    }

    async getExpenseReport(circleId: string, options: { startDate?: string; endDate?: string } = {}) {
        try {
            const startDate = options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const endDate = options.endDate || new Date().toISOString();

            // Total expenses
            const expensesResult = await prisma.$queryRaw<Array<{ total: string }>>`
                SELECT COALESCE(SUM((attributes->>'amount')::numeric), 0) as total
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                AND created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
                AND deleted_at IS NULL
            `;

            // Total income
            const incomeResult = await prisma.$queryRaw<Array<{ total: string }>>`
                SELECT COALESCE(SUM((attributes->>'amount')::numeric), 0) as total
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND (attributes->>'type' = 'income' OR attributes->>'transactionType' = 'income')
                AND created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
                AND deleted_at IS NULL
            `;

            // Category breakdown
            const categoryResult = await prisma.$queryRaw<Array<{ category: string | null; total: string; count: bigint }>>`
                SELECT attributes->>'category' as category,
                       SUM((attributes->>'amount')::numeric) as total,
                       COUNT(*)::bigint as count
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                AND created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
                AND deleted_at IS NULL
                GROUP BY attributes->>'category'
                ORDER BY total DESC
            `;

            // Member breakdown
            const memberResult = await prisma.$queryRaw<Array<{ owner_id: string; first_name: string | null; last_name: string | null; total: string; count: bigint }>>`
                SELECT e.owner_id, u.first_name, u.last_name,
                       SUM((e.attributes->>'amount')::numeric) as total,
                       COUNT(*)::bigint as count
                FROM entities e
                LEFT JOIN core.users u ON e.owner_id = u.id
                WHERE e.type_name = 'finance_transaction'
                AND e.application_id = ${circleId}::uuid
                AND (e.attributes->>'type' = 'expense' OR e.attributes->>'transactionType' = 'expense')
                AND e.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
                AND e.deleted_at IS NULL
                GROUP BY e.owner_id, u.first_name, u.last_name
                ORDER BY total DESC
            `;

            // Top expenses
            const topResult = await prisma.$queryRaw<Array<{ id: string; description: string | null; category: string | null; amount: string; created_at: Date }>>`
                SELECT id, attributes->>'description' as description,
                       attributes->>'category' as category,
                       (attributes->>'amount')::numeric as amount,
                       created_at
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                AND created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
                AND deleted_at IS NULL
                ORDER BY (attributes->>'amount')::numeric DESC
                LIMIT 10
            `;

            // Daily trends
            const trendsResult = await prisma.$queryRaw<Array<{ date: Date; expenses: string; income: string }>>`
                SELECT DATE(created_at) as date,
                       SUM(CASE WHEN attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense' 
                           THEN (attributes->>'amount')::numeric ELSE 0 END) as expenses,
                       SUM(CASE WHEN attributes->>'type' = 'income' OR attributes->>'transactionType' = 'income' 
                           THEN (attributes->>'amount')::numeric ELSE 0 END) as income
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
                AND deleted_at IS NULL
                GROUP BY DATE(created_at)
                ORDER BY date
            `;

            const totalExpenses = parseFloat(expensesResult[0]?.total || '0');
            const totalIncome = parseFloat(incomeResult[0]?.total || '0');

            return {
                period: `${startDate.split('T')[0]} to ${endDate.split('T')[0]}`,
                totalExpenses,
                totalIncome,
                netAmount: totalIncome - totalExpenses,
                categoryBreakdown: categoryResult.map(row => ({
                    category: row.category || 'Uncategorized',
                    total: parseFloat(row.total),
                    count: Number(row.count),
                    percentage: totalExpenses > 0 ? Math.round((parseFloat(row.total) / totalExpenses) * 100) : 0
                })),
                memberBreakdown: memberResult.map(row => ({
                    userId: row.owner_id,
                    name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown',
                    total: parseFloat(row.total),
                    count: Number(row.count)
                })),
                topExpenses: topResult.map(row => ({
                    id: row.id,
                    description: row.description,
                    category: row.category,
                    amount: parseFloat(row.amount),
                    date: row.created_at
                })),
                trends: trendsResult.map(row => ({
                    date: row.date,
                    expenses: parseFloat(row.expenses),
                    income: parseFloat(row.income)
                }))
            };
        } catch (error) {
            console.error('Error getting expense report:', error);
            return {
                period: 'Current',
                totalExpenses: 0,
                totalIncome: 0,
                netAmount: 0,
                categoryBreakdown: [],
                memberBreakdown: [],
                topExpenses: [],
                trends: []
            };
        }
    }

    async getExpenseInsights(circleId: string) {
        try {
            const insights: Array<{ type: string; title: string; description: string; severity: string }> = [];

            // Check for spending increase
            const spendingResult = await prisma.$queryRaw<Array<{ month: Date; total: string }>>`
                WITH monthly AS (
                    SELECT DATE_TRUNC('month', created_at) as month,
                           SUM((attributes->>'amount')::numeric) as total
                    FROM entities
                    WHERE type_name = 'finance_transaction'
                    AND application_id = ${circleId}::uuid
                    AND (attributes->>'type' = 'expense' OR attributes->>'transactionType' = 'expense')
                    AND created_at > NOW() - INTERVAL '2 months'
                    AND deleted_at IS NULL
                    GROUP BY DATE_TRUNC('month', created_at)
                    ORDER BY month DESC
                    LIMIT 2
                )
                SELECT * FROM monthly
            `;

            if (spendingResult.length === 2) {
                const currentMonth = parseFloat(spendingResult[0]?.total || '0');
                const lastMonth = parseFloat(spendingResult[1]?.total || '0');
                if (lastMonth > 0 && currentMonth > lastMonth * 1.2) {
                    insights.push({
                        type: 'spending_increase',
                        title: 'Spending Increase',
                        description: `Your spending increased by ${Math.round(((currentMonth - lastMonth) / lastMonth) * 100)}% compared to last month.`,
                        severity: 'warning'
                    });
                }
            }

            // Check for budget overruns
            const budgetResult = await prisma.$queryRaw<Array<{ id: string; category: string | null; budget_amount: string; spent: string }>>`
                SELECT b.id, b.attributes->>'category' as category,
                       (b.attributes->>'amount')::numeric as budget_amount,
                       COALESCE(SUM((e.attributes->>'amount')::numeric), 0) as spent
                FROM entities b
                LEFT JOIN entities e ON e.type_name = 'finance_transaction' 
                    AND e.attributes->>'category' = b.attributes->>'category'
                    AND e.application_id = b.application_id
                    AND e.created_at > DATE_TRUNC('month', NOW())
                    AND e.deleted_at IS NULL
                WHERE b.type_name = 'finance_budget'
                AND b.application_id = ${circleId}::uuid
                AND b.deleted_at IS NULL
                GROUP BY b.id, b.attributes->>'category', b.attributes->>'amount'
            `;

            for (const row of budgetResult) {
                const budget = parseFloat(row.budget_amount);
                const spent = parseFloat(row.spent);
                if (budget > 0 && spent > budget) {
                    insights.push({
                        type: 'budget_exceeded',
                        title: 'Budget Exceeded',
                        description: `You've exceeded your ${row.category} budget by ${Math.round(((spent - budget) / budget) * 100)}%.`,
                        severity: 'error'
                    });
                } else if (budget > 0 && spent > budget * 0.8) {
                    insights.push({
                        type: 'budget_warning',
                        title: 'Budget Warning',
                        description: `You've used ${Math.round((spent / budget) * 100)}% of your ${row.category} budget.`,
                        severity: 'warning'
                    });
                }
            }

            // Check for recurring expenses reminder
            const recurringResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
                SELECT COUNT(*)::bigint as count
                FROM entities
                WHERE type_name = 'finance_transaction'
                AND application_id = ${circleId}::uuid
                AND attributes->>'isRecurring' = 'true'
                AND deleted_at IS NULL
            `;

            const recurringCount = Number(recurringResult[0]?.count || 0);
            if (recurringCount > 0) {
                insights.push({
                    type: 'recurring_reminder',
                    title: 'Recurring Expenses',
                    description: `You have ${recurringCount} recurring expenses set up.`,
                    severity: 'info'
                });
            }

            return insights;
        } catch (error) {
            console.error('Error getting expense insights:', error);
            return [];
        }
    }

    // Search & Recurring
    async searchExpenses(query: string, circleId: string) {
        return entityService.searchEntities('finance_transaction', query, { applicationId: circleId });
    }

    async getRecurringExpenses(circleId: string) {
        return (await entityService.queryEntities('finance_transaction', {
            applicationId: circleId,
            status: 'active',
            filters: { isRecurring: 'true' }
        } as any)).entities;
    }

    async getUpcomingExpenses(circleId: string, days: number) {
        return (await entityService.queryEntities('finance_transaction', {
            applicationId: circleId,
            status: 'active',
            filters: { status: 'pending' }
        } as any)).entities;
    }

    async getPaymentMethods() {
        return [
            { method: 'cash', icon: 'cash', isActive: true },
            { method: 'card', icon: 'card', isActive: true },
            { method: 'bank_transfer', icon: 'bank', isActive: true },
            { method: 'mobile_payment', icon: 'cellphone', isActive: true }
        ];
    }

    async getExpenseReminders(circleId: string) {
        return (await entityService.queryEntities('finance_reminder', {
            applicationId: circleId,
            status: 'active'
        } as any)).entities;
    }

    async setExpenseReminder(data: any) {
        return entityService.createEntity({
            typeName: 'finance_reminder',
            ownerId: data.userId,
            applicationId: data.circleId,
            attributes: data
        });
    }
}

export default new FinanceService();
