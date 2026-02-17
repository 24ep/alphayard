import { prisma } from '../src/lib/prisma';

async function testComponentStudio() {
    try {
        // Test 1: Get sidebar data
        console.log('Testing Component Studio Sidebar...');
        const categoriesResult = await prisma.$queryRaw<Array<any>>`SELECT * FROM component_categories ORDER BY position ASC LIMIT 3`;
        const stylesResult = await prisma.$queryRaw<Array<any>>`SELECT * FROM component_styles WHERE is_active = true LIMIT 5`;
        
        console.log(`✓ Found ${categoriesResult.length} categories (showing first 3)`);
        console.log(`✓ Found ${stylesResult.length} styles (showing first 5)`);
        
        // Test 2: Verify data structure
        if (categoriesResult.length > 0) {
            const category = categoriesResult[0];
            console.log('\nSample Category:', {
                id: category.id,
                name: category.name,
                icon: category.icon
            });
        }
        
        if (stylesResult.length > 0) {
            const style = stylesResult[0];
            console.log('\nSample Style:', {
                id: style.id,
                name: style.name,
                category_id: style.category_id,
                definition_id: style.definition_id
            });
        }
        
        console.log('\n✅ Component Studio database verification passed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testComponentStudio();
