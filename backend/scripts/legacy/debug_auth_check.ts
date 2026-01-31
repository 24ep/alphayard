
import { UserModel } from './src/models/UserModel';

async function testCheckUser() {
  console.log('Testing UserModel.findByEmail...');
  try {
    const email = 'test@example.com';
    const user = await UserModel.findByEmail(email);
    console.log('User found:', !!user);
    if (user) {
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);
    } else {
      console.log('User not found (correct if no user exists, but no crash!)');
    }
  } catch (err) {
    console.error('Check failed with error:', err);
  }
}

testCheckUser();
