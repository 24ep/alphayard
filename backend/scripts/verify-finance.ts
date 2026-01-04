
import { pool } from '../src/config/database';
import financeService from '../src/services/financeService';

async function verifyFinance() {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();

        const userId = 'f739edde-45f8-4aa9-82c8-c1876f434683'; // Test User

        console.log('1. Creating Account...');
        const account = await financeService.createAccount({
            user_id: userId,
            name: 'Test Setup Account',
            type: 'bank',
            balance: 1000,
            currency: 'USD',
            color: '#00FF00',
            is_included_in_net_worth: true
        });
        console.log('Account Created:', account.id);

        console.log('2. Creating Transaction...');
        const tx = await financeService.createTransaction({
            user_id: userId,
            account_id: account.id,
            amount: 50,
            type: 'expense',
            date: new Date().toISOString(),
            note: 'Test Expense',
            is_family_shared: false
        });
        console.log('Transaction Created:', tx.id);

        console.log('3. Fetching Transactions...');
        const txs = await financeService.getTransactions(userId, { limit: 5 });
        console.log('Transactions fetched:', txs.length);
        const found = txs.find(t => t.id === tx.id);

        if (found && found.note === 'Test Expense') {
            console.log('✅ Transaction verification SUCCESS');
        } else {
            console.error('❌ Transaction verification FAILED');
        }

        console.log('4. Cleaning up...');
        await financeService.deleteAccount(account.id); // Should cascade delete transactions usually, or manual delete
        // If no cascade, we might need manual delete of tx first
        try {
            await client.query('DELETE FROM financial_transactions WHERE id = $1', [tx.id]);
        } catch (e) {
            // Ignore if already deleted by cascade
        }
        await financeService.deleteAccount(account.id); // Retry if needed
        console.log('Cleanup complete.');

        client.release();
    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        pool.end();
    }
}

verifyFinance();
