import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';

async function fixAdminPassword() {
    try {
        // Generate proper bcrypt hash for 'admin123'
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('Generated hash for "admin123":', hash);
        
        // Update the admin user's password
        const result = await prisma.$queryRaw<Array<{ email: string; first_name: string; last_name: string }>>`
            UPDATE admin_users SET password_hash = ${hash} WHERE email = ${'admin@bondarys.com'} RETURNING email, first_name, last_name
        `;
        
        if (result.length > 0) {
            console.log('\n✅ Password updated successfully for:', result[0]);
            
            // Test the password
            const testResult = await prisma.$queryRaw<Array<{ password_hash: string }>>`
                SELECT password_hash FROM admin_users WHERE email = ${'admin@bondarys.com'}
            `;
            
            const isValid = await bcrypt.compare(password, testResult[0].password_hash);
            console.log('Password verification test:', isValid ? '✅ PASS' : '❌ FAIL');
        } else {
            console.log('❌ No admin user found to update');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdminPassword();
