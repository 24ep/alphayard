# Seed Files Inventory

## Database Seed Files (SQL)

### `backend/src/database/`
- **seed.sql** - Main database seed file with sample data (users, circles, posts, etc.)
- **schema.sql** - Database schema definitions
- **init.sql** - Database initialization script

### `backend/seeds/`
- **component_styles_seed.sql** - Component styles seed data

### `backend/src/migrations/`
- **023_seed_translations.sql** - Translation seed data

---

## JavaScript Seed Scripts

### `backend/scripts/`
- **seed-bondary-app.js** ⭐ - Main app seeding (applications, users, circles, branding, screens)
- **seed-admin-users.js** - Admin users seeding
- **seed-admin-user.js** - Single admin user seeding
- **run-seed.js** - Run seed operations
- **run-component-studio-seed.js** - Component studio seeding
- **scan-mobile-pages.js** ⭐ - Scan and list all mobile app pages (NEW)

### `backend/setup/`
- **100-seed-admin.js** - Admin user setup seed
- **12-seed-app-config-data.js** - App configuration data seeding

### `backend/scripts/legacy/`
- **seed_family.js** - Legacy family seeding

---

## TypeScript Seed Scripts

### `backend/src/scripts/`
- **seed-screens.ts** - Screen inventory seeding
- **seed-components.ts** - Component styles seeding
- **seed-countries.ts** - Countries reference data
- **seed-circle-data.ts** - Circle data seeding
- **seed-chat.ts** - Chat system seeding
- **seed-admin-rbac.ts** - Admin RBAC (roles/permissions) seeding
- **seed-icons.ts** - Icon seeding
- **seed-grouped-screens.ts** - Grouped screens seeding
- **seed-mobile-design.ts** - Mobile design system seeding
- **seed-mobile-styles.ts** - Mobile styles seeding
- **seed-mobile-screens-to-admin.ts** - Mobile screens to admin seeding
- **extract-and-seed-screens.ts** - Extract and seed screens from mobile app
- **seed-localization.js** - Localization data seeding
- **seed-emotions.js** - Emotion data seeding

### `backend/scripts/`
- **seed-component-studio-targeted.ts** - Component studio targeted seeding
- **seed-countries.ts** - Countries seeding (duplicate)

---

## Summary

### By Purpose:
- **App Setup**: seed-bondary-app.js, seed-admin-users.js
- **Screens**: seed-screens.ts, seed-grouped-screens.ts, extract-and-seed-screens.ts
- **Components**: seed-components.ts, component_styles_seed.sql
- **Data**: seed-circle-data.ts, seed-chat.ts, seed-countries.ts
- **Admin**: seed-admin-rbac.ts, seed-admin-users.js
- **Mobile**: seed-mobile-design.ts, seed-mobile-styles.ts, seed-mobile-screens-to-admin.ts
- **Utilities**: scan-mobile-pages.js

### By Type:
- **SQL Files**: 3 files
- **JavaScript Files**: 10 files
- **TypeScript Files**: 14 files

### Total Seed Files: 27 files

---

## Recently Created/Updated:
- ⭐ **seed-bondary-app.js** - Updated with signup backgrounds and multiple page backgrounds
- ⭐ **scan-mobile-pages.js** - New script to scan all mobile app pages (83 screens found)
