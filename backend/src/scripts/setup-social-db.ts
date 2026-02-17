
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function setupSocialDB() {
    try {
        console.log('Connected to database');

        // Enable UUID extension
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        // Create social_posts table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS social_posts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                circle_id UUID NOT NULL, -- Assuming references families(id)
                author_id UUID NOT NULL, -- Assuming references users(id)
                content TEXT,
                type VARCHAR(50) DEFAULT 'text',
                media_urls JSONB DEFAULT '[]',
                tags TEXT[] DEFAULT '{}',
                location TEXT,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                visibility VARCHAR(50) DEFAULT 'circle',
                status VARCHAR(50) DEFAULT 'active',
                likes_count INTEGER DEFAULT 0,
                shares_count INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                views_count INTEGER DEFAULT 0,
                is_hidden BOOLEAN DEFAULT FALSE,
                is_deleted BOOLEAN DEFAULT FALSE,
                is_reported BOOLEAN DEFAULT FALSE,
                report_count INTEGER DEFAULT 0,
                last_reported_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created social_posts table');

        // Create social_comments table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS social_comments (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
                author_id UUID NOT NULL,
                content TEXT,
                media_type VARCHAR(50),
                media_url TEXT,
                parent_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
                likes_count INTEGER DEFAULT 0,
                is_hidden BOOLEAN DEFAULT FALSE,
                is_reported BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created social_comments table');

        // Create social_reports table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS social_reports (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
                reporter_id UUID NOT NULL,
                reason VARCHAR(50),
                description TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                reviewed_by UUID,
                reviewed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created social_reports table');

        // Create social_activities table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS social_activities (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                action VARCHAR(50),
                details TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created social_activities table');
        
        // Create social_comment_likes table (inferred from code: EXISTS(SELECT 1 FROM social_comment_likes ...))
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS social_comment_likes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(comment_id, user_id)
            );
        `);
         console.log('Checked/Created social_comment_likes table');


    } catch (err) {
        console.error('Error setting up social DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

setupSocialDB();

