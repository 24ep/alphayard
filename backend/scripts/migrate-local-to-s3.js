/**
 * Migration Script: Move local uploads to MinIO/S3
 * 
 * This script migrates files from the local `uploads/system/admin/` directory
 * to MinIO/S3 storage and updates all URL references in component-styles and branding settings.
 * 
 * Usage: node scripts/migrate-local-to-s3.js
 */

require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient, Prisma } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const UPLOADS_BASE_DIR = path.join(__dirname, '../uploads');
const LOCAL_UPLOAD_DIRS = [
    { path: path.join(UPLOADS_BASE_DIR, 'system/admin'), folder: 'system/admin' },
    { path: path.join(UPLOADS_BASE_DIR, 'chat'), folder: 'chat' },
    { path: path.join(UPLOADS_BASE_DIR, 'popups'), folder: 'popups' },
    { path: path.join(UPLOADS_BASE_DIR, 'social'), folder: 'social/posts' },
];
const S3_ENDPOINT = process.env.AWS_S3_ENDPOINT || 'http://localhost:9000';
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'bondarys-files';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

// Initialize S3 Client
const s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
    },
    forcePathStyle: true, // Required for MinIO
});

// Get mime type from extension
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Upload file to S3 and create entity
async function uploadFileToS3(filePath, filename, folder = 'system/admin') {
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(filename);
    const fileId = uuidv4();
    const extension = path.extname(filename);
    const s3Key = `uploads/${folder}/${fileId}${extension}`;

    console.log(`  Uploading ${filename} to S3 as ${s3Key}...`);

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
    }));

    // Create entity in unified_entities table
    const entityId = uuidv4();
    const now = new Date().toISOString();
    const fileData = JSON.stringify({
        original_name: filename,
        file_name: `${fileId}${extension}`,
        file_id: fileId,
        mime_type: mimeType,
        size: fileBuffer.length,
        path: s3Key,
        uploaded_by: 'migration-script',
        is_shared: true,
        is_favorite: false,
        metadata: { migrated_from: 'local', original_path: filePath }
    });
    
    await prisma.$executeRaw(Prisma.sql`
        INSERT INTO unified_entities (id, type, data, status, created_at, updated_at)
        VALUES (${entityId}::uuid, 'file', ${fileData}::jsonb, 'active', ${now}::timestamp, ${now}::timestamp)
    `);

    // Return the proxy URL
    const proxyUrl = `${API_BASE_URL}/api/v1/storage/proxy/${entityId}`;
    console.log(`  ✓ Uploaded. New URL: ${proxyUrl}`);
    
    return { entityId, proxyUrl, originalFilename: filename };
}

// Update URLs in an object recursively
function updateUrls(obj, urlMapping) {
    if (typeof obj === 'string') {
        // Check if this string is a URL that needs to be replaced
        for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
            if (obj.includes(oldUrl)) {
                return obj.replace(oldUrl, newUrl);
            }
        }
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => updateUrls(item, urlMapping));
    }
    
    if (obj && typeof obj === 'object') {
        const updated = {};
        for (const [key, value] of Object.entries(obj)) {
            updated[key] = updateUrls(value, urlMapping);
        }
        return updated;
    }
    
    return obj;
}

// Main migration function
async function migrate() {
    console.log('='.repeat(60));
    console.log('Migration: Local Uploads -> MinIO/S3');
    console.log('='.repeat(60));
    console.log('');
    console.log(`S3 Endpoint: ${S3_ENDPOINT}`);
    console.log(`S3 Bucket: ${S3_BUCKET}`);
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log('');

    // Upload each file and build URL mapping
    const urlMapping = {};
    const results = [];
    let totalFiles = 0;

    // Process each upload directory
    for (const dirConfig of LOCAL_UPLOAD_DIRS) {
        const LOCAL_UPLOADS_DIR = dirConfig.path;
        const folderName = dirConfig.folder;

        // Check if local uploads directory exists
        if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
            console.log(`Directory not found: ${folderName} - skipping`);
            continue;
        }

        // Get list of files to migrate
        const files = fs.readdirSync(LOCAL_UPLOADS_DIR).filter(f => {
            const fullPath = path.join(LOCAL_UPLOADS_DIR, f);
            return !fs.statSync(fullPath).isDirectory();
        });

        if (files.length === 0) {
            console.log(`No files in ${folderName} - skipping`);
            continue;
        }

        console.log(`\nFound ${files.length} files in ${folderName}:`);
        files.forEach(f => console.log(`  - ${f}`));
        console.log('');

        for (const filename of files) {
            const filePath = path.join(LOCAL_UPLOADS_DIR, filename);
            try {
                const result = await uploadFileToS3(filePath, filename, folderName);
                results.push(result);
                totalFiles++;
                
                // Build URL mapping for both patterns
                const oldUrl = `http://localhost:4000/uploads/${folderName}/${filename}`;
                urlMapping[oldUrl] = result.proxyUrl;
                
                // Also map just the path portion
                urlMapping[`/uploads/${folderName}/${filename}`] = result.proxyUrl;
            } catch (error) {
                console.error(`  ✗ Failed to upload ${filename}:`, error.message);
            }
        }
    }

    if (totalFiles === 0) {
        console.log('No files found to migrate.');
        await prisma.$disconnect();
        return;
    }

    console.log('\n' + '-'.repeat(60));
    console.log('Updating database references...');
    console.log('-'.repeat(60) + '\n');

    // Update component_styles in app_settings
    try {
        const rows = await prisma.$queryRawUnsafe(
            `SELECT value FROM app_settings WHERE key = 'component_styles'`
        );
        
        if (rows.length > 0) {
            const componentStyles = rows[0].value;
            const updatedStyles = updateUrls(componentStyles, urlMapping);
            
            await prisma.$executeRaw(Prisma.sql`
                UPDATE app_settings SET value = ${JSON.stringify(updatedStyles)}::jsonb, updated_at = NOW() WHERE key = 'component_styles'
            `);
            console.log('✓ Updated component_styles in app_settings');
        }
    } catch (error) {
        console.log('  Note: component_styles not found in app_settings or error:', error.message);
    }

    // Update branding in app_settings
    try {
        const rows = await prisma.$queryRawUnsafe(
            `SELECT value FROM app_settings WHERE key = 'branding'`
        );
        
        if (rows.length > 0) {
            const branding = rows[0].value;
            const updatedBranding = updateUrls(branding, urlMapping);
            
            await prisma.$executeRaw(Prisma.sql`
                UPDATE app_settings SET value = ${JSON.stringify(updatedBranding)}::jsonb, updated_at = NOW() WHERE key = 'branding'
            `);
            console.log('✓ Updated branding in app_settings');
        }
    } catch (error) {
        console.log('  Note: branding not found in app_settings or error:', error.message);
    }

    // Update branding in applications table
    try {
        const rows = await prisma.$queryRawUnsafe(
            `SELECT id, branding FROM applications WHERE branding IS NOT NULL`
        );
        
        for (const row of rows) {
            const updatedBranding = updateUrls(row.branding, urlMapping);
            await prisma.$executeRaw(Prisma.sql`
                UPDATE applications SET branding = ${JSON.stringify(updatedBranding)}::jsonb, updated_at = NOW() WHERE id = ${row.id}::uuid
            `);
        }
        console.log(`✓ Updated branding in ${rows.length} applications`);
    } catch (error) {
        console.log('  Note: Error updating applications:', error.message);
    }

    // Update chat message attachment URLs
    try {
        const rows = await prisma.$queryRawUnsafe(
            `SELECT id, metadata FROM chat_messages WHERE metadata IS NOT NULL AND (metadata->>'imageUrl' IS NOT NULL OR metadata->>'fileUrl' IS NOT NULL)`
        );
        
        let updatedCount = 0;
        for (const row of rows) {
            const updatedMetadata = updateUrls(row.metadata, urlMapping);
            if (JSON.stringify(updatedMetadata) !== JSON.stringify(row.metadata)) {
                await prisma.$executeRaw(Prisma.sql`
                    UPDATE chat_messages SET metadata = ${JSON.stringify(updatedMetadata)}::jsonb, updated_at = NOW() WHERE id = ${row.id}::uuid
                `);
                updatedCount++;
            }
        }
        console.log(`✓ Updated ${updatedCount} chat message attachments`);
    } catch (error) {
        console.log('  Note: Error updating chat messages:', error.message);
    }

    // Update social post media URLs (unified_entities with type = 'social_post')
    try {
        const rows = await prisma.$queryRawUnsafe(
            `SELECT id, data FROM unified_entities WHERE type = 'social_post' AND data IS NOT NULL AND (data->>'media_urls' IS NOT NULL OR data->'media_urls' IS NOT NULL)`
        );
        
        let updatedCount = 0;
        for (const row of rows) {
            const updatedData = updateUrls(row.data, urlMapping);
            if (JSON.stringify(updatedData) !== JSON.stringify(row.data)) {
                await prisma.$executeRaw(Prisma.sql`
                    UPDATE unified_entities SET data = ${JSON.stringify(updatedData)}::jsonb, updated_at = NOW() WHERE id = ${row.id}::uuid
                `);
                updatedCount++;
            }
        }
        console.log(`✓ Updated ${updatedCount} social post media URLs`);
    } catch (error) {
        console.log('  Note: Error updating social posts:', error.message);
    }

    // Update component-styles.json in S3 (if exists)
    try {
        const s3Key = 'settings/component-styles.json';
        const response = await s3Client.send(new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
        }));
        
        const streamToString = (stream) => new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
        
        const content = await streamToString(response.Body);
        const componentStyles = JSON.parse(content);
        const updatedStyles = updateUrls(componentStyles, urlMapping);
        
        await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: JSON.stringify(updatedStyles, null, 2),
            ContentType: 'application/json',
        }));
        console.log('✓ Updated component-styles.json in S3');
    } catch (error) {
        console.log('  Note: component-styles.json not found in S3 or error:', error.message);
    }

    // Update local component-styles.json file (for backup/reference)
    const localStylesPath = path.join(__dirname, '../uploads/settings/component-styles.json');
    if (fs.existsSync(localStylesPath)) {
        try {
            const content = fs.readFileSync(localStylesPath, 'utf8');
            const styles = JSON.parse(content);
            const updatedStyles = updateUrls(styles, urlMapping);
            fs.writeFileSync(localStylesPath, JSON.stringify(updatedStyles, null, 2), 'utf8');
            console.log('✓ Updated local component-styles.json');
        } catch (error) {
            console.log('  Note: Error updating local component-styles.json:', error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Migration Complete!');
    console.log('='.repeat(60));
    console.log(`\nMigrated ${results.length} files to S3.`);
    console.log('\nURL Mapping:');
    for (const [old, newUrl] of Object.entries(urlMapping)) {
        if (old.startsWith('http')) {
            console.log(`  ${old}`);
            console.log(`  -> ${newUrl}\n`);
        }
    }
    
    console.log('\n⚠️  After verifying the migration is successful, you can delete the local files:');
    console.log(`    rm -rf ${UPLOADS_BASE_DIR}/system`);
    console.log(`    rm -rf ${UPLOADS_BASE_DIR}/chat`);
    console.log(`    rm -rf ${UPLOADS_BASE_DIR}/popups`);
    console.log(`    rm -rf ${UPLOADS_BASE_DIR}/social`);
    
    await prisma.$disconnect();
}

// Run migration
migrate().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});
