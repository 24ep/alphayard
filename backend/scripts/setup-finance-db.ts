
import { prisma } from '../src/lib/prisma';

async function setupFinanceDb() {
    try {
        console.log('Connecting to DB...');

        console.log('Creating Finance Tables...');

        // Financial Accounts
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS financial_accounts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                family_id UUID REFERENCES circles(id) ON DELETE SET NULL,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                balance DECIMAL(15, 2) DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'USD',
                color VARCHAR(50),
                is_included_in_net_worth BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        console.log('- financial_accounts created');

        // Financial Categories
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS financial_categories (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                type VARCHAR(20) NOT NULL,
                icon VARCHAR(50),
                color VARCHAR(50),
                parent_category_id UUID REFERENCES financial_categories(id),
                is_system_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        console.log('- financial_categories created');

        // Financial Transactions
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS financial_transactions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
                category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
                amount DECIMAL(15, 2) NOT NULL,
                type VARCHAR(20) NOT NULL,
                date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                note TEXT,
                is_family_shared BOOLEAN DEFAULT FALSE,
                location_label VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        console.log('- financial_transactions created');

        // Financial Goals
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS financial_goals (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                target_amount DECIMAL(15, 2) NOT NULL,
                current_amount DECIMAL(15, 2) DEFAULT 0,
                target_date TIMESTAMP WITH TIME ZONE,
                color VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        console.log('- financial_goals created');

        // Seed some categories if empty
        const countRes = await prisma.$queryRaw<Array<{ count: string }>>`
            SELECT count(*) FROM financial_categories
        `;
        if (parseInt(countRes[0].count) === 0) {
            console.log('Seeding default categories...');
            await prisma.$executeRaw`
                INSERT INTO financial_categories (name, type, is_system_default, icon, color) VALUES
                ('Salary', 'income', true, 'wallet', '#4CAF50'),
                ('Food', 'expense', true, 'utensils', '#F44336'),
                ('Transport', 'expense', true, 'car', '#2196F3'),
                ('Shopping', 'expense', true, 'shopping-bag', '#E91E63'),
                ('Housing', 'expense', true, 'home', '#9C27B0'),
                ('Entertainment', 'expense', true, 'film', '#673AB7')
            `;
        }

        console.log('Finance DB setup complete.');
    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupFinanceDb();
