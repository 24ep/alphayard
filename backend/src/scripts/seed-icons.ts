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

// Social Media Icons - All common platforms
const SOCIAL_ICONS = [
    // Major Platforms
    { id: 'facebook', name: 'Facebook', category: 'major' },
    { id: 'instagram', name: 'Instagram', category: 'major' },
    { id: 'twitter', name: 'Twitter / X', category: 'major' },
    { id: 'linkedin', name: 'LinkedIn', category: 'major' },
    { id: 'youtube', name: 'YouTube', category: 'major' },
    { id: 'tiktok', name: 'TikTok', category: 'major' },
    // Messaging Apps
    { id: 'whatsapp', name: 'WhatsApp', category: 'messaging' },
    { id: 'telegram', name: 'Telegram', category: 'messaging' },
    { id: 'messenger', name: 'Messenger', category: 'messaging' },
    { id: 'wechat', name: 'WeChat', category: 'messaging' },
    { id: 'line', name: 'LINE', category: 'messaging' },
    { id: 'viber', name: 'Viber', category: 'messaging' },
    { id: 'signal', name: 'Signal', category: 'messaging' },
    { id: 'discord', name: 'Discord', category: 'messaging' },
    { id: 'slack', name: 'Slack', category: 'messaging' },
    { id: 'skype', name: 'Skype', category: 'messaging' },
    { id: 'zoom', name: 'Zoom', category: 'messaging' },
    { id: 'teams', name: 'Microsoft Teams', category: 'messaging' },
    { id: 'kakao', name: 'KakaoTalk', category: 'messaging' },
    { id: 'zalo', name: 'Zalo', category: 'messaging' },
    // Social Networks
    { id: 'snapchat', name: 'Snapchat', category: 'social' },
    { id: 'pinterest', name: 'Pinterest', category: 'social' },
    { id: 'reddit', name: 'Reddit', category: 'social' },
    { id: 'tumblr', name: 'Tumblr', category: 'social' },
    { id: 'threads', name: 'Threads', category: 'social' },
    { id: 'mastodon', name: 'Mastodon', category: 'social' },
    { id: 'bluesky', name: 'Bluesky', category: 'social' },
    { id: 'vk', name: 'VK (VKontakte)', category: 'social' },
    { id: 'weibo', name: 'Weibo', category: 'social' },
    { id: 'qq', name: 'QQ', category: 'social' },
    { id: 'douyin', name: 'Douyin', category: 'social' },
    { id: 'kuaishou', name: 'Kuaishou', category: 'social' },
    { id: 'xhs', name: 'Xiaohongshu (RED)', category: 'social' },
    { id: 'clubhouse', name: 'Clubhouse', category: 'social' },
    { id: 'quora', name: 'Quora', category: 'social' },
    // Professional & Tech
    { id: 'github', name: 'GitHub', category: 'tech' },
    { id: 'gitlab', name: 'GitLab', category: 'tech' },
    { id: 'bitbucket', name: 'Bitbucket', category: 'tech' },
    { id: 'stackoverflow', name: 'Stack Overflow', category: 'tech' },
    { id: 'dribbble', name: 'Dribbble', category: 'tech' },
    { id: 'behance', name: 'Behance', category: 'tech' },
    { id: 'figma', name: 'Figma', category: 'tech' },
    { id: 'codepen', name: 'CodePen', category: 'tech' },
    { id: 'devto', name: 'Dev.to', category: 'tech' },
    { id: 'hashnode', name: 'Hashnode', category: 'tech' },
    // Media & Entertainment
    { id: 'medium', name: 'Medium', category: 'media' },
    { id: 'twitch', name: 'Twitch', category: 'media' },
    { id: 'spotify', name: 'Spotify', category: 'media' },
    { id: 'soundcloud', name: 'SoundCloud', category: 'media' },
    { id: 'apple-music', name: 'Apple Music', category: 'media' },
    { id: 'youtube-music', name: 'YouTube Music', category: 'media' },
    { id: 'deezer', name: 'Deezer', category: 'media' },
    { id: 'tidal', name: 'Tidal', category: 'media' },
    { id: 'netflix', name: 'Netflix', category: 'media' },
    { id: 'hulu', name: 'Hulu', category: 'media' },
    { id: 'disney-plus', name: 'Disney+', category: 'media' },
    { id: 'hbo-max', name: 'HBO Max', category: 'media' },
    { id: 'prime-video', name: 'Prime Video', category: 'media' },
    { id: 'vimeo', name: 'Vimeo', category: 'media' },
    { id: 'dailymotion', name: 'Dailymotion', category: 'media' },
    { id: 'podcast', name: 'Podcast', category: 'media' },
    { id: 'apple-podcasts', name: 'Apple Podcasts', category: 'media' },
    // Business & Support
    { id: 'email', name: 'Email', category: 'business' },
    { id: 'phone', name: 'Phone', category: 'business' },
    { id: 'sms', name: 'SMS', category: 'business' },
    { id: 'website', name: 'Website', category: 'business' },
    { id: 'blog', name: 'Blog', category: 'business' },
    { id: 'rss', name: 'RSS Feed', category: 'business' },
    { id: 'live-chat', name: 'Live Chat', category: 'business' },
    { id: 'support', name: 'Support', category: 'business' },
    { id: 'help', name: 'Help Center', category: 'business' },
    { id: 'faq', name: 'FAQ', category: 'business' },
    { id: 'booking', name: 'Booking', category: 'business' },
    { id: 'calendar', name: 'Calendar', category: 'business' },
    { id: 'location', name: 'Location / Maps', category: 'business' },
    // E-commerce & Payments
    { id: 'shopify', name: 'Shopify', category: 'commerce' },
    { id: 'amazon', name: 'Amazon', category: 'commerce' },
    { id: 'ebay', name: 'eBay', category: 'commerce' },
    { id: 'etsy', name: 'Etsy', category: 'commerce' },
    { id: 'lazada', name: 'Lazada', category: 'commerce' },
    { id: 'shopee', name: 'Shopee', category: 'commerce' },
    { id: 'paypal', name: 'PayPal', category: 'commerce' },
    { id: 'stripe', name: 'Stripe', category: 'commerce' },
    { id: 'visa', name: 'Visa', category: 'commerce' },
    { id: 'mastercard', name: 'Mastercard', category: 'commerce' },
    { id: 'amex', name: 'American Express', category: 'commerce' },
    // App Stores
    { id: 'apple-store', name: 'App Store', category: 'stores' },
    { id: 'google-play', name: 'Google Play', category: 'stores' },
    { id: 'microsoft-store', name: 'Microsoft Store', category: 'stores' },
    { id: 'huawei-appgallery', name: 'Huawei AppGallery', category: 'stores' },
    { id: 'samsung-galaxy-store', name: 'Samsung Galaxy Store', category: 'stores' },
    // Gaming
    { id: 'steam', name: 'Steam', category: 'gaming' },
    { id: 'epic-games', name: 'Epic Games', category: 'gaming' },
    { id: 'playstation', name: 'PlayStation', category: 'gaming' },
    { id: 'xbox', name: 'Xbox', category: 'gaming' },
    { id: 'nintendo', name: 'Nintendo', category: 'gaming' },
    { id: 'gog', name: 'GOG', category: 'gaming' },
    { id: 'origin', name: 'EA / Origin', category: 'gaming' },
    { id: 'battlenet', name: 'Battle.net', category: 'gaming' },
];

// Country Flags - Worldwide
const COUNTRY_FLAGS = [
    // Special/Global
    { id: 'flag-world', name: 'Worldwide / Global', code: 'WORLD', region: 'special' },
    { id: 'flag-eu', name: 'European Union', code: 'EU', region: 'special' },
    { id: 'flag-un', name: 'United Nations', code: 'UN', region: 'special' },
    // Americas
    { id: 'flag-us', name: 'United States', code: 'US', region: 'americas' },
    { id: 'flag-ca', name: 'Canada', code: 'CA', region: 'americas' },
    { id: 'flag-mx', name: 'Mexico', code: 'MX', region: 'americas' },
    { id: 'flag-br', name: 'Brazil', code: 'BR', region: 'americas' },
    { id: 'flag-ar', name: 'Argentina', code: 'AR', region: 'americas' },
    { id: 'flag-co', name: 'Colombia', code: 'CO', region: 'americas' },
    { id: 'flag-cl', name: 'Chile', code: 'CL', region: 'americas' },
    { id: 'flag-pe', name: 'Peru', code: 'PE', region: 'americas' },
    // Europe
    { id: 'flag-gb', name: 'United Kingdom', code: 'GB', region: 'europe' },
    { id: 'flag-de', name: 'Germany', code: 'DE', region: 'europe' },
    { id: 'flag-fr', name: 'France', code: 'FR', region: 'europe' },
    { id: 'flag-it', name: 'Italy', code: 'IT', region: 'europe' },
    { id: 'flag-es', name: 'Spain', code: 'ES', region: 'europe' },
    { id: 'flag-pt', name: 'Portugal', code: 'PT', region: 'europe' },
    { id: 'flag-nl', name: 'Netherlands', code: 'NL', region: 'europe' },
    { id: 'flag-be', name: 'Belgium', code: 'BE', region: 'europe' },
    { id: 'flag-ch', name: 'Switzerland', code: 'CH', region: 'europe' },
    { id: 'flag-at', name: 'Austria', code: 'AT', region: 'europe' },
    { id: 'flag-se', name: 'Sweden', code: 'SE', region: 'europe' },
    { id: 'flag-no', name: 'Norway', code: 'NO', region: 'europe' },
    { id: 'flag-dk', name: 'Denmark', code: 'DK', region: 'europe' },
    { id: 'flag-fi', name: 'Finland', code: 'FI', region: 'europe' },
    { id: 'flag-ie', name: 'Ireland', code: 'IE', region: 'europe' },
    { id: 'flag-pl', name: 'Poland', code: 'PL', region: 'europe' },
    { id: 'flag-cz', name: 'Czech Republic', code: 'CZ', region: 'europe' },
    { id: 'flag-hu', name: 'Hungary', code: 'HU', region: 'europe' },
    { id: 'flag-ro', name: 'Romania', code: 'RO', region: 'europe' },
    { id: 'flag-gr', name: 'Greece', code: 'GR', region: 'europe' },
    { id: 'flag-ua', name: 'Ukraine', code: 'UA', region: 'europe' },
    { id: 'flag-ru', name: 'Russia', code: 'RU', region: 'europe' },
    { id: 'flag-tr', name: 'Turkey', code: 'TR', region: 'europe' },
    // Asia
    { id: 'flag-th', name: 'Thailand', code: 'TH', region: 'asia' },
    { id: 'flag-jp', name: 'Japan', code: 'JP', region: 'asia' },
    { id: 'flag-cn', name: 'China', code: 'CN', region: 'asia' },
    { id: 'flag-tw', name: 'Taiwan', code: 'TW', region: 'asia' },
    { id: 'flag-hk', name: 'Hong Kong', code: 'HK', region: 'asia' },
    { id: 'flag-kr', name: 'South Korea', code: 'KR', region: 'asia' },
    { id: 'flag-in', name: 'India', code: 'IN', region: 'asia' },
    { id: 'flag-id', name: 'Indonesia', code: 'ID', region: 'asia' },
    { id: 'flag-my', name: 'Malaysia', code: 'MY', region: 'asia' },
    { id: 'flag-sg', name: 'Singapore', code: 'SG', region: 'asia' },
    { id: 'flag-ph', name: 'Philippines', code: 'PH', region: 'asia' },
    { id: 'flag-vn', name: 'Vietnam', code: 'VN', region: 'asia' },
    { id: 'flag-mm', name: 'Myanmar', code: 'MM', region: 'asia' },
    { id: 'flag-kh', name: 'Cambodia', code: 'KH', region: 'asia' },
    { id: 'flag-la', name: 'Laos', code: 'LA', region: 'asia' },
    { id: 'flag-bd', name: 'Bangladesh', code: 'BD', region: 'asia' },
    { id: 'flag-pk', name: 'Pakistan', code: 'PK', region: 'asia' },
    { id: 'flag-np', name: 'Nepal', code: 'NP', region: 'asia' },
    { id: 'flag-lk', name: 'Sri Lanka', code: 'LK', region: 'asia' },
    // Middle East
    { id: 'flag-ae', name: 'United Arab Emirates', code: 'AE', region: 'middle-east' },
    { id: 'flag-sa', name: 'Saudi Arabia', code: 'SA', region: 'middle-east' },
    { id: 'flag-qa', name: 'Qatar', code: 'QA', region: 'middle-east' },
    { id: 'flag-kw', name: 'Kuwait', code: 'KW', region: 'middle-east' },
    { id: 'flag-bh', name: 'Bahrain', code: 'BH', region: 'middle-east' },
    { id: 'flag-om', name: 'Oman', code: 'OM', region: 'middle-east' },
    { id: 'flag-il', name: 'Israel', code: 'IL', region: 'middle-east' },
    { id: 'flag-jo', name: 'Jordan', code: 'JO', region: 'middle-east' },
    { id: 'flag-lb', name: 'Lebanon', code: 'LB', region: 'middle-east' },
    { id: 'flag-eg', name: 'Egypt', code: 'EG', region: 'middle-east' },
    { id: 'flag-ir', name: 'Iran', code: 'IR', region: 'middle-east' },
    { id: 'flag-iq', name: 'Iraq', code: 'IQ', region: 'middle-east' },
    // Africa
    { id: 'flag-za', name: 'South Africa', code: 'ZA', region: 'africa' },
    { id: 'flag-ng', name: 'Nigeria', code: 'NG', region: 'africa' },
    { id: 'flag-ke', name: 'Kenya', code: 'KE', region: 'africa' },
    { id: 'flag-gh', name: 'Ghana', code: 'GH', region: 'africa' },
    { id: 'flag-et', name: 'Ethiopia', code: 'ET', region: 'africa' },
    { id: 'flag-tz', name: 'Tanzania', code: 'TZ', region: 'africa' },
    { id: 'flag-ma', name: 'Morocco', code: 'MA', region: 'africa' },
    { id: 'flag-dz', name: 'Algeria', code: 'DZ', region: 'africa' },
    { id: 'flag-tn', name: 'Tunisia', code: 'TN', region: 'africa' },
    // Oceania
    { id: 'flag-au', name: 'Australia', code: 'AU', region: 'oceania' },
    { id: 'flag-nz', name: 'New Zealand', code: 'NZ', region: 'oceania' },
    { id: 'flag-fj', name: 'Fiji', code: 'FJ', region: 'oceania' },
];

async function main() {
    await client.connect();
    console.log('Connected to database');

    // Get all active applications
    console.log('Fetching active applications...');
    const result = await client.query('SELECT id, name, branding FROM applications WHERE is_active = true');
    const apps = result.rows;

    if (apps.length === 0) {
        console.log('No active applications found. Create an application first.');
        return;
    }

    console.log(`Found ${apps.length} active applications.`);

    for (const app of apps) {
        console.log(`\nSeeding icons for app: ${app.name} (${app.id})...`);

        // Get current branding
        let branding = app.branding || {};
        
        // Initialize icons config if not exists
        if (!branding.icons) {
            branding.icons = {
                social: {},
                flags: {}
            };
        }

        let socialAdded = 0;
        let flagsAdded = 0;

        // Seed social icons
        for (const icon of SOCIAL_ICONS) {
            if (!branding.icons.social[icon.id]) {
                branding.icons.social[icon.id] = {
                    id: icon.id,
                    name: icon.name,
                    category: icon.category,
                    iconUrl: '', // Empty until user uploads
                    isActive: true
                };
                socialAdded++;
            }
        }

        // Seed country flags
        for (const flag of COUNTRY_FLAGS) {
            if (!branding.icons.flags[flag.id]) {
                branding.icons.flags[flag.id] = {
                    id: flag.id,
                    name: flag.name,
                    code: flag.code,
                    region: flag.region,
                    iconUrl: '', // Empty until user uploads
                    isActive: true
                };
                flagsAdded++;
            }
        }

        // Update the application with new branding
        await client.query(
            'UPDATE applications SET branding = $1 WHERE id = $2',
            [JSON.stringify(branding), app.id]
        );

        console.log(`   ✅ Added ${socialAdded} social icons, ${flagsAdded} country flags.`);
    }

    console.log('\n✅ Icon seeding complete for all applications.');
}

main()
    .catch((e) => {
        console.error('Error seeding icons:', e);
        process.exit(1);
    })
    .finally(async () => {
        await client.end();
    });
