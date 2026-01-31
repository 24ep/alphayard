// @ts-nocheck
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

const mobilePages = [
    {
        slug: 'home_screen',
        title: 'Home Screen',
        status: 'published',
        components: [
            {
                componentType: 'WelcomeSection',
                position: 0,
                props: { showcircleDropdown: true }
            },
            {
                componentType: 'TabNavigation',
                position: 1,
                props: { tabs: ['You', 'Financial', 'Social'] }
            },
            {
                componentType: 'Container',
                position: 2,
                props: { style: { padding: 16 } },
                styles: { backgroundColor: '#f5f5f5' }
            }
        ]
    },
    {
        slug: 'social_feed',
        title: 'Social Feed',
        status: 'published',
        components: [
            {
                componentType: 'List',
                position: 0,
                props: {
                    dataSource: 'posts',
                    renderItem: 'PostCard'
                }
            },
            {
                componentType: 'FloatingButton',
                position: 1,
                props: { action: 'create_post', icon: 'plus' }
            }
        ]
    },
    {
        slug: 'profile_screen',
        title: 'User Profile',
        status: 'published',
        components: [
            {
                componentType: 'Header',
                position: 0,
                props: { title: 'Profile' }
            },
            {
                componentType: 'UserProfileCard',
                position: 1,
                props: { showAvatar: true, showStats: true }
            },
            {
                componentType: 'MenuSettings',
                position: 2,
                props: {
                    items: [
                        { label: 'Edit Profile', action: 'edit_profile' },
                        { label: 'Notifications', action: 'notifications' },
                        { label: 'Privacy', action: 'privacy' }
                    ]
                }
            }
        ]
    },
    {
        slug: 'gallery_screen',
        title: 'Gallery',
        status: 'published',
        components: [
            {
                componentType: 'Grid',
                position: 0,
                props: { columns: 3, gap: 2 }
            }
        ]
    }
];

async function seed() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Create Tables (if they don't exist)
        // Note: In Supabase/Production, these likely exist. This is for ensuring dev env matches.
        console.log('Ensuring tables exist...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        metadata JSONB DEFAULT '{}',
        seo_config JSONB DEFAULT '{}',
        created_by UUID, -- Can be null for system pages
        updated_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        published_at TIMESTAMP WITH TIME ZONE,
        scheduled_for TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        parent_id UUID,
        template_id UUID
      );
    `);

        // Add unique constraint on slug if not exists (handled by UNIQUE in CREATE, but good for safety)

        await client.query(`
      CREATE TABLE IF NOT EXISTS page_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
        component_type VARCHAR(255) NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        props JSONB DEFAULT '{}',
        styles JSONB DEFAULT '{}',
        responsive_config JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        // 2. Seed Pages
        console.log('Seeding pages...');

        // Get a simulated user ID (optional)
        const systemUserId = '00000000-0000-0000-0000-000000000000'; // System UUID

        for (const page of mobilePages) {
            // Upsert page
            const pageRes = await client.query(`
        INSERT INTO pages (slug, title, status, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $4)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          status = EXCLUDED.status
        RETURNING id;
      `, [page.slug, page.title, page.status, systemUserId]);

            const pageId = pageRes.rows[0].id;

            // Clear existing components for this page (to re-seed cleanly)
            await client.query(`DELETE FROM page_components WHERE page_id = $1`, [pageId]);

            // Insert components
            if (page.components.length > 0) {
                for (const comp of page.components) {
                    await client.query(`
            INSERT INTO page_components (page_id, component_type, position, props, styles)
            VALUES ($1, $2, $3, $4, $5)
          `, [
                        pageId,
                        comp.componentType,
                        comp.position,
                        JSON.stringify(comp.props || {}),
                        JSON.stringify(comp.styles || {})
                    ]);
                }
            }
        }

        console.log('Seeding completed successfully! ✅');
    } catch (err) {
        console.error('Error seeding CMS:', err);
    } finally {
        await client.end();
    }
}

seed();

