
// @ts-nocheck
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function check() {
    try {
        console.log('Connected to database');

        const rooms = await prisma.$queryRawUnsafe<any[]>('SELECT count(*) FROM chat_rooms');
        const msgs = await prisma.$queryRawUnsafe<any[]>('SELECT count(*) FROM bondarys.chat_messages');
        console.log('Chat Rooms:', rooms[0].count);
        console.log('Chat Messages:', msgs[0].count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
