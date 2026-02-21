-- Migration script to move tables from core schema to public schema
-- This should be run after updating the Prisma schema

-- Move Page-related tables
ALTER TABLE IF EXISTS core.content_pages SET SCHEMA public;
ALTER TABLE IF EXISTS core.content_versions SET SCHEMA public;
ALTER TABLE IF EXISTS core.publishing_workflows SET SCHEMA public;

-- Move CMS-related tables
ALTER TABLE IF EXISTS core.content_templates SET SCHEMA public;
ALTER TABLE IF EXISTS core.cms_components SET SCHEMA public;
ALTER TABLE IF EXISTS core.cms_categories SET SCHEMA public;
ALTER TABLE IF EXISTS core.cms_content SET SCHEMA public;
ALTER TABLE IF EXISTS core.cms_comments SET SCHEMA public;
ALTER TABLE IF EXISTS core.component_styles SET SCHEMA public;
ALTER TABLE IF EXISTS core.content_analytics SET SCHEMA public;

-- Move System-related tables
ALTER TABLE IF EXISTS core.system_config SET SCHEMA public;
ALTER TABLE IF EXISTS core.app_settings SET SCHEMA public;
ALTER TABLE IF EXISTS core.countries SET SCHEMA public;
ALTER TABLE IF EXISTS core.login_configs SET SCHEMA public;

-- Move Core Business tables
ALTER TABLE IF EXISTS core.applications SET SCHEMA public;
ALTER TABLE IF EXISTS core.users SET SCHEMA public;
ALTER TABLE IF EXISTS core.user_applications SET SCHEMA public;
ALTER TABLE IF EXISTS core.email_templates SET SCHEMA public;

-- Move Localization tables
ALTER TABLE IF EXISTS core.languages SET SCHEMA public;
ALTER TABLE IF EXISTS core.currencies SET SCHEMA public;
ALTER TABLE IF EXISTS core.translation_keys SET SCHEMA public;
ALTER TABLE IF EXISTS core.translations SET SCHEMA public;

-- Move User Management tables
ALTER TABLE IF EXISTS core.files SET SCHEMA public;
ALTER TABLE IF EXISTS core.notifications SET SCHEMA public;
ALTER TABLE IF EXISTS core.user_settings SET SCHEMA public;

-- Move Session & Device tables
ALTER TABLE IF EXISTS core.user_sessions SET SCHEMA public;
ALTER TABLE IF EXISTS core.user_devices SET SCHEMA public;
ALTER TABLE IF EXISTS core.user_mfa SET SCHEMA public;

-- Move Security & Identity tables
ALTER TABLE IF EXISTS core.security_policies SET SCHEMA public;
ALTER TABLE IF EXISTS core.user_groups SET SCHEMA public;
ALTER TABLE IF EXISTS core.user_group_members SET SCHEMA public;
ALTER TABLE IF EXISTS core.identity_audit_log SET SCHEMA public;
ALTER TABLE IF EXISTS core.oauth_providers SET SCHEMA public;
ALTER TABLE IF EXISTS core.login_history SET SCHEMA public;

-- Move File & Gallery tables
ALTER TABLE IF EXISTS core.file_folders SET SCHEMA public;
ALTER TABLE IF EXISTS core.gallery_items SET SCHEMA public;
ALTER TABLE IF EXISTS core.gallery_albums SET SCHEMA public;

-- Move Notification tables
ALTER TABLE IF EXISTS core.user_push_tokens SET SCHEMA public;

-- Move Subscription tables
ALTER TABLE IF EXISTS core.subscription_plans SET SCHEMA public;
ALTER TABLE IF EXISTS core.subscriptions SET SCHEMA public;

-- Update sequences if they exist
ALTER SEQUENCE IF EXISTS core.content_pages_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.content_versions_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.publishing_workflows_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.content_templates_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.cms_components_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.cms_categories_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.cms_content_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.cms_comments_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.component_styles_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.content_analytics_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.app_settings_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.login_configs_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.applications_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.users_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.user_applications_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.email_templates_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.languages_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.currencies_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.translation_keys_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.translations_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.files_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.notifications_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.user_settings_id_seq SET SCHEMA public;

-- Add sequences for newly migrated tables
ALTER SEQUENCE IF EXISTS core.user_sessions_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.user_devices_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.user_mfa_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.security_policies_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.user_groups_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.user_group_members_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.identity_audit_log_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.oauth_providers_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.login_history_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.file_folders_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.gallery_items_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.gallery_albums_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.user_push_tokens_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.subscription_plans_id_seq SET SCHEMA public;
ALTER SEQUENCE IF EXISTS core.subscriptions_id_seq SET SCHEMA public;

-- Update indexes and constraints
-- Note: Foreign key constraints may need to be recreated after schema migration

COMMIT;
