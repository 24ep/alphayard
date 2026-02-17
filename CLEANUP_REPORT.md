# Unnecessary & outdated files – scan report

## Removed (safe to delete)

| File | Reason |
|------|--------|
| `RegisterScreen_old.tsx` (root) | Old backup; app uses `mobile/src/screens/auth/RegisterScreen.tsx` |
| `backend/src/scripts/seed-jaroonwit.ts.bak` | Backup file |
| `admin/pages/dashboard.tsx.backup` | Backup file |
| `admin/build_log.txt`, `build_log_2.txt` … `build_log_7.txt` | Build logs (artifacts) |
| `admin/build_output.txt` | Build output artifact |
| `admin/final_build.txt`, `admin/final_error.txt` | Build/final error artifacts |

## Optional / consider removing

| Location | Notes |
|----------|--------|
| `admin/.next/`, `web/.next/` | Next.js build output; usually in `.gitignore`. Run `next build` to regenerate. |
| `backend/diagnostic_v3_output.txt`, `migration_log.txt`, `tables.txt`, `tsc_errors*.txt`, `schema_dump.txt` | One-off diagnostic/output files in backend root. |
| `backend/otp_output.txtcd` | Typo in filename; likely debug output. |
| `backend/scripts/legacy/*.txt` | Legacy debug/output (e.g. `backend_debug.txt`, `errors.txt`). Keep if you still run those scripts. |
| `backend/src/database/migrations/034_summary_collection_endpoints_fix.md` | Doc only; keep for reference or delete if no longer needed. |

## Keep

- `backend/scripts/legacy/*.js`, `*.ts` – may still be used for one-off fixes or migrations.
- `backend/src/services/backupService.ts` – “backup” in name is the feature, not a backup file.
- Files that only *mention* “deprecated” or “unused” in comments – they are still part of the codebase until you refactor.
