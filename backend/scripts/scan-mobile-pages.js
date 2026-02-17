const fs = require('fs');
const path = require('path');

// Scan mobile screens directory
const screensDir = path.join(__dirname, '../../mobile/src/screens');
const navigationDir = path.join(__dirname, '../../mobile/src/navigation');

// Categories for organizing screens
const categories = {
    auth: [],
    main: [],
    chat: [],
    circle: [],
    settings: [],
    security: [],
    safety: [],
    legal: [],
    call: [],
    ai: [],
    billing: [],
    storage: [],
    tasks: [],
    admin: [],
    onboarding: [],
    profile: [],
    other: []
};

// Function to categorize screen
function categorizeScreen(filePath) {
    const relativePath = path.relative(screensDir, filePath);
    const parts = relativePath.split(path.sep);
    
    if (parts.length > 1) {
        const category = parts[0];
        if (categories[category]) {
            return category;
        }
    }
    return 'other';
}

// Function to extract screen name from file path
function getScreenName(filePath) {
    const fileName = path.basename(filePath, '.tsx');
    // Convert PascalCase to kebab-case for ID
    const id = fileName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
    
    // Convert to readable name
    const name = fileName
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, c => c.toUpperCase());
    
    return { id, name, fileName };
}

// Scan all screen files
function scanScreens(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const screens = [];
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            screens.push(...scanScreens(fullPath));
        } else if (file.isFile() && file.name.endsWith('Screen.tsx') && !file.name.includes('.test.') && !file.name.includes('.styles.')) {
            const category = categorizeScreen(fullPath);
            const { id, name, fileName } = getScreenName(fullPath);
            
            screens.push({
                id,
                name,
                fileName,
                category,
                path: fullPath
            });
        }
    }
    
    return screens;
}

// Main execution
console.log('🔍 Scanning mobile app screens...\n');

const allScreens = scanScreens(screensDir);

// Organize by category
const organized = {};
allScreens.forEach(screen => {
    if (!organized[screen.category]) {
        organized[screen.category] = [];
    }
    organized[screen.category].push(screen);
});

// Display results
console.log('='.repeat(80));
console.log('MOBILE APP PAGES INVENTORY');
console.log('='.repeat(80));
console.log(`\nTotal Screens Found: ${allScreens.length}\n`);

// Display by category
Object.keys(organized).sort().forEach(category => {
    const screens = organized[category];
    console.log(`\n📁 ${category.toUpperCase()} (${screens.length} screens)`);
    console.log('-'.repeat(80));
    screens.forEach(screen => {
        console.log(`  • ${screen.name.padEnd(40)} [id: ${screen.id}]`);
    });
});

// Generate seed-ready format
console.log('\n\n' + '='.repeat(80));
console.log('SEED-READY SCREEN CONFIGURATION');
console.log('='.repeat(80));
console.log('\nconst MOBILE_SCREENS = [');

allScreens.forEach((screen, index) => {
    const isLast = index === allScreens.length - 1;
    console.log(`    {`);
    console.log(`        id: '${screen.id}',`);
    console.log(`        name: '${screen.name}',`);
    console.log(`        category: '${screen.category}',`);
    console.log(`        background: '',`);
    console.log(`        resizeMode: 'cover',`);
    console.log(`        type: 'screen'`);
    console.log(`    }${isLast ? '' : ','}`);
});

console.log('];\n');

// Summary by category
console.log('='.repeat(80));
console.log('SUMMARY BY CATEGORY');
console.log('='.repeat(80));
Object.keys(organized).sort().forEach(category => {
    console.log(`${category.padEnd(20)}: ${organized[category].length} screens`);
});

console.log('\n✅ Scan complete!\n');
