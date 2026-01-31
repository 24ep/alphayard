import { pool } from '../config/database';

async function seedChat() {
  console.log('🌱 Seeding Chat Module...');

  try {
    // 1. Get a circle
    const circleRes = await pool.query('SELECT * FROM circles LIMIT 1');
    if (circleRes.rows.length === 0) {
      console.log('❌ No families found. Please run basic seeds first.');
      process.exit(1);
    }
    const circle = circleRes.rows[0];
    console.log(`🏠 Using circle: ${circle.name} (${circle.id})`);

    // 2. Get circle Members
    const membersRes = await pool.query(
      'SELECT u.id, u.first_name, u.email FROM circle_members fm JOIN users u ON u.id = fm.user_id WHERE fm.circle_id = $1',
      [circle.id]
    );
    const members = membersRes.rows;
    if (members.length < 2) {
      console.log('⚠️ Not enough circle members for a conversation. Need at least 2.');
      // Look for a test user to add if needed, or just warn
    }
    console.log(`👥 Found ${members.length} members: ${members.map(m => m.first_name).join(', ')}`);

    // 3. Get or Create "circle" Chat Room
    let roomRes = await pool.query(
      "SELECT * FROM chat_rooms WHERE circle_id = $1 AND type = 'circle'",
      [circle.id]
    );

    let roomId;
    if (roomRes.rows.length === 0) {
      console.log('Creates new circle chat room...');
      roomRes = await pool.query(
        "INSERT INTO chat_rooms (circle_id, name, type) VALUES ($1, $2, 'circle') RETURNING id",
        [circle.id, `${circle.name} circle Chat`]
      );
      roomId = roomRes.rows[0].id;
    } else {
      roomId = roomRes.rows[0].id;
      console.log(`Reusing existing chat room: ${roomId}`);
    }

    // 4. Clear existing messages in this room (optional, for clean seed)
    await pool.query('DELETE FROM chat_messages WHERE room_id = $1', [roomId]);
    console.log('🧹 Cleared old messages.');

    // 5. Seed Messages
    // We'll create a conversation sequence.
    // If not enough members, we'll just use the ones we have or even duplicate.
    const sender1 = members[0];
    const sender2 = members[1] || members[0]; // Self-talk if only 1 member
    const sender3 = members[2] || members[0];

    const messages = [
      { sender: sender1, text: "Hey everyone! Who's home for dinner tonight?", offsetMinutes: 60 },
      { sender: sender2, text: "I'll be there around 6:30 PM.", offsetMinutes: 55 },
      { sender: sender3, text: "I'm staying at school for soccer practice, back at 7.", offsetMinutes: 50 },
      { sender: sender1, text: "Okay, we'll wait for you. Pizza night?", offsetMinutes: 45 },
      { sender: sender3, text: "Yes! Pepperoni please! 🍕", offsetMinutes: 44 },
      { sender: sender2, text: "Sounds good to me.", offsetMinutes: 40 },
      { sender: sender1, text: "Ordered. See you soon!", offsetMinutes: 30 },
      { sender: sender2, text: "Traffic is terrible 😩", offsetMinutes: 10 },
      { sender: sender1, text: "Drive safe!", offsetMinutes: 5 },
    ];

    for (const msg of messages) {
      // Calculate timestamp based on offset
      const timestamp = new Date(Date.now() - msg.offsetMinutes * 60000);

      await pool.query(
        "INSERT INTO chat_messages (room_id, sender_id, content, type, created_at, updated_at) VALUES ($1, $2, $3, 'text', $4, $4)",
        [roomId, msg.sender.id, msg.text, timestamp]
      );
    }

    console.log(`✅ Seeded ${messages.length} messages.`);
    console.log('✨ Chat Module Seeding Complete!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await pool.end();
    process.exit(1);
  }
}

seedChat();

