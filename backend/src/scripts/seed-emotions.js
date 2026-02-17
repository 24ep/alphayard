/**
 * Seed script for emotion records
 * Run this to populate example emotion data for testing the heat map
 * 
 * Usage: node src/scripts/seed-emotions.js
 */

const { PrismaClient } = require('../prisma/generated/prisma');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

const emotionTypes = ['very_bad', 'bad', 'neutral', 'good', 'very_good'];

async function seedEmotions() {
    console.log('Seeding emotion data...');

    try {
        // Get a user to seed data for (use first user found)
        const userResult = await prisma.$queryRawUnsafe('SELECT id FROM users LIMIT 1');

        if (userResult.length === 0) {
            console.error('No users found. Please create a user first.');
            await prisma.$disconnect();
            process.exit(1);
        }

        const userId = userResult[0].id;
        console.log(`Seeding emotions for user: ${userId}`);

        // Delete existing emotion records for this user
        // Escape userId to prevent SQL injection (UUID format)
        const escapedUserId = typeof userId === 'string' ? userId.replace(/'/g, "''") : String(userId);
        await prisma.$executeRawUnsafe(`DELETE FROM emotion_records WHERE user_id = '${escapedUserId}'::uuid`);
        console.log('Cleared existing emotion records');

        // Generate emotion records for the last 90 days
        const today = new Date();
        const records = [];

        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(12, 0, 0, 0);

            // Skip some days randomly (30% chance of skipping)
            if (Math.random() > 0.7) continue;

            // Generate weighted random emotion (more likely to be positive)
            const weights = [0.05, 0.1, 0.25, 0.35, 0.25];
            const random = Math.random();
            let cumulative = 0;
            let emotionIndex = 2;

            for (let j = 0; j < weights.length; j++) {
                cumulative += weights[j];
                if (random < cumulative) {
                    emotionIndex = j;
                    break;
                }
            }

            const emotionType = emotionTypes[emotionIndex];

            records.push({
                userId,
                emotionType,
                recordedAt: date.toISOString(),
            });
        }

        console.log(`Inserting ${records.length} emotion records...`);

        // Insert records one by one
        for (const record of records) {
            // Escape values to prevent SQL injection
            const escapedUserId = typeof record.userId === 'string' ? record.userId.replace(/'/g, "''") : String(record.userId);
            const escapedEmotionType = record.emotionType.replace(/'/g, "''");
            const escapedRecordedAt = record.recordedAt.replace(/'/g, "''");
            await prisma.$executeRawUnsafe(
                `INSERT INTO emotion_records (user_id, emotion_type, recorded_at) VALUES ('${escapedUserId}'::uuid, '${escapedEmotionType}', '${escapedRecordedAt}'::timestamp)`
            );
        }

        console.log('✅ Emotion data seeded successfully!');
        console.log(`Total records: ${records.length}`);

        // Show distribution
        const distribution = {};
        records.forEach(r => {
            distribution[r.emotionType] = (distribution[r.emotionType] || 0) + 1;
        });
        console.log('Distribution:', distribution);

    } catch (error) {
        console.error('Error seeding emotions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedEmotions();
