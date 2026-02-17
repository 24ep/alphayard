-- ============================================================================
-- BOUNDARY DATABASE INITIALIZATION
-- ============================================================================
-- 
-- This script initializes a fresh Boundary database.
-- Run this script to set up a new database from scratch.
--
-- Usage:
--   createdb boundary
--   psql -U postgres -d boundary -f init.sql
--
-- Or to reset:
--   dropdb boundary && createdb boundary
--   psql -U postgres -d boundary -f init.sql
--
-- ============================================================================

\echo 'Starting Boundary database initialization...'
\echo ''

-- Step 1: Create schema (tables, indexes, triggers)
\echo '=== Step 1: Creating schema ==='
\i schema.sql

-- Step 2: Seed with sample data
\echo ''
\echo '=== Step 2: Seeding data ==='
\i seed.sql

\echo ''
\echo '=== Database initialization complete! ==='
\echo ''
\echo 'Schemas created: core, admin, bondarys'
\echo 'Run "\\dn" to see all schemas'
\echo 'Run "\\dt core.*" to see core tables'
\echo 'Run "\\dt admin.*" to see admin tables'  
\echo 'Run "\\dt bondarys.*" to see bondarys tables'
