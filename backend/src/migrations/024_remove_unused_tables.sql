-- Migration: 024_remove_unused_tables.sql
-- Description: Remove unused tables identified through codebase analysis
-- Date: 2026-02-06
-- WARNING: This is a destructive operation. Ensure you have a database backup before running.

-- ============================================================================
-- REMOVE UNUSED TABLES FROM CORE SCHEMA
-- ============================================================================

-- Subscription-related tables (not implemented in codebase)
DROP TABLE IF EXISTS core.subscriptions CASCADE;
DROP TABLE IF EXISTS core.subscription_plans CASCADE;

-- Currency reference table (not used)
DROP TABLE IF EXISTS core.currencies CASCADE;

-- Gallery tables (not used - files/storage uses different approach)
DROP TABLE IF EXISTS core.gallery_items CASCADE;
DROP TABLE IF EXISTS core.gallery_albums CASCADE;

-- ============================================================================
-- REMOVE UNUSED TABLES FROM PUBLIC SCHEMA (from legacy migrations)
-- ============================================================================

-- Social media management tables (not implemented)
DROP TABLE IF EXISTS social_media_posts CASCADE;
DROP TABLE IF EXISTS social_media_accounts CASCADE;

-- House management (not implemented)
DROP TABLE IF EXISTS house_management CASCADE;

-- System notifications (using core.notifications instead)
DROP TABLE IF EXISTS system_notifications CASCADE;

-- Page builder audit tables (not used)
DROP TABLE IF EXISTS page_audit_log CASCADE;
DROP TABLE IF EXISTS page_hierarchy CASCADE;

-- ============================================================================
-- CLEAN UP: Remove orphaned indexes if they exist
-- ============================================================================

-- Note: CASCADE in DROP TABLE should handle related indexes,
-- but this ensures cleanup of any standalone indexes

-- Done!
COMMENT ON SCHEMA core IS 'Core schema - cleaned up unused tables on 2026-02-06';
