// Simple test to check authentication token
console.log('Checking authentication token...');
const token = localStorage.getItem('admin_token');
const user = localStorage.getItem('admin_user');

console.log('Token exists:', !!token);
console.log('User exists:', !!user);

if (token) {
  console.log('Token length:', token.length);
  console.log('Token starts with:', token.substring(0, 20) + '...');
}

if (user) {
  try {
    const parsedUser = JSON.parse(user);
    console.log('User email:', parsedUser.email);
    console.log('User role:', parsedUser.role);
  } catch (e) {
    console.error('Failed to parse user:', e);
  }
}
