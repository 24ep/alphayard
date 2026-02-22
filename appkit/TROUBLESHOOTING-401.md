# 🔧 **401 Unauthorized Error Troubleshooting Guide**

## 🚨 **Issue: POST https://appkits.up.railway.app/api/admin/applications 401 (Unauthorized)**

### **Root Cause Analysis**

The 401 error indicates that the JWT authentication is failing. This typically happens when:

1. **JWT_SECRET is not properly configured** in production
2. **Admin user doesn't exist** in the database
3. **Token format is incompatible** between old Express and new Next.js
4. **Environment variables are missing** on Railway

---

## 🔍 **Step 1: Check Debug Endpoint**

### **Access Debug Information**
```bash
curl https://appkits.up.railway.app/api/debug/auth
```

**Expected Response:**
```json
{
  "environment": {
    "NODE_ENV": "production",
    "JWT_SECRET_SET": true,
    "JWT_SECRET_LENGTH": 64,
    "JWT_SECRET_PLACEHOLDER": false
  },
  "database": {
    "connected": true,
    "adminUsers": 1,
    "adminEmails": [
      {
        "email": "admin@appkit.com",
        "active": true,
        "superAdmin": true
      }
    ]
  }
}
```

**Problem Indicators:**
- ❌ `JWT_SECRET_PLACEHOLDER: true` → JWT_SECRET not set
- ❌ `JWT_SECRET_SET: false` → JWT_SECRET missing
- ❌ `database.connected: false` → Database connection issue
- ❌ `adminUsers: 0` → No admin user in database

---

## 🔧 **Step 2: Fix Railway Environment Variables**

### **Required Environment Variables for Railway**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Authentication (CRITICAL)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Admin User (for seeding)
ADMIN_EMAIL=admin@appkit.com
ADMIN_PASSWORD=change-this-password

# Production Settings
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_SITE_URL=https://appkits.up.railway.app
```

### **How to Set on Railway:**

1. **Go to Railway Dashboard**
2. **Select your appkit service**
3. **Go to Settings → Variables**
4. **Add the environment variables above**
5. **Redeploy the service**

---

## 🗄️ **Step 3: Ensure Admin User Exists**

### **Option A: Automatic Seeding**
If you have the seed script, the admin user should be created automatically.

### **Option B: Manual Admin Creation**
If no admin exists, create one via database:

```sql
-- Connect to your Railway database
INSERT INTO "AdminUser" (id, email, password, isActive, isSuperAdmin, createdAt, updatedAt)
VALUES (
  'admin-uuid-here',
  'admin@appkit.com',
  '$2b$10$hashed-password-here',
  true,
  true,
  NOW(),
  NOW()
);
```

### **Option C: Use Debug Info**
Check the debug endpoint to see if admin users exist.

---

## 🔄 **Step 4: Token Compatibility Issues**

### **The Problem**
Old Express tokens might not work with new Next.js JWT verification.

### **Solution: Re-authenticate**
1. **Clear browser localStorage**
2. **Login again** at `/login`
3. **New token will be generated** with Next.js

### **Token Format Check**
```javascript
// Check token in browser localStorage
console.log(localStorage.getItem('admin_token'));

// Should be a valid JWT string (not encrypted)
```

---

## 🚀 **Step 5: Test Authentication Flow**

### **1. Test Login Endpoint**
```bash
curl -X POST https://appkits.up.railway.app/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@appkit.com","password":"change-this-password"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-id",
    "email": "admin@appkit.com",
    "role": "admin"
  }
}
```

### **2. Test Protected Endpoint**
```bash
curl -X GET https://appkits.up.railway.app/api/v1/admin/applications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: JWT_SECRET Placeholder**
**Error**: Using placeholder JWT_SECRET
**Solution**: Set a real JWT_SECRET in Railway environment variables

### **Issue 2: Database Connection**
**Error**: Can't connect to database
**Solution**: Verify DATABASE_URL is correct and accessible

### **Issue 3: No Admin User**
**Error**: Admin user doesn't exist
**Solution**: Ensure admin seeding runs or create admin manually

### **Issue 4: Token Expired**
**Error**: Token is invalid/expired
**Solution**: Clear localStorage and login again

### **Issue 5: CORS Issues**
**Error**: CORS policy blocking requests
**Solution**: Check CORS_ORIGIN environment variable

---

## 📋 **Troubleshooting Checklist**

### **Environment Variables ✅**
- [ ] JWT_SECRET is set (32+ characters)
- [ ] JWT_SECRET is not the placeholder
- [ ] DATABASE_URL is correct
- [ ] NODE_ENV is "production"
- [ ] ADMIN_EMAIL and ADMIN_PASSWORD set

### **Database ✅**
- [ ] Database connection works
- [ ] Admin user exists
- [ ] Admin user is active
- [ ] Prisma schema is up to date

### **Authentication ✅**
- [ ] Can login successfully
- [ ] Token is generated
- [ ] Token validates on protected routes
- [ ] CORS headers are correct

### **Application ✅**
- [ ] Next.js build successful
- [ ] Application starts without errors
- [ ] Health endpoint responds
- [ ] Debug endpoint works

---

## 🚨 **Emergency Fix: Reset Admin**

If everything else fails, reset the admin user:

```bash
# 1. Access Railway database
# 2. Delete existing admin user
DELETE FROM "AdminUser" WHERE email = 'admin@appkit.com';

# 3. Restart the application (triggers seeding)
# 4. Try logging in again
```

---

## 📞 **Get Help**

### **Debug Information to Collect**
1. **Debug endpoint output**: `/api/debug/auth`
2. **Railway logs**: Check Railway dashboard logs
3. **Environment variables**: Verify all are set correctly
4. **Database status**: Confirm database is accessible

### **Common Log Messages**
- `JWT_SECRET must be set to a real secret in production` → Set JWT_SECRET
- `Invalid or inactive user` → Admin user missing or inactive
- `Database connection failed` → Check DATABASE_URL

---

## 🎯 **Quick Fix Summary**

1. **Set JWT_SECRET** in Railway environment variables
2. **Verify DATABASE_URL** is correct
3. **Check debug endpoint** at `/api/debug/auth`
4. **Clear browser storage** and re-login
5. **Ensure admin user exists** in database

**The most common cause is missing or incorrect JWT_SECRET in production!** 🔐
