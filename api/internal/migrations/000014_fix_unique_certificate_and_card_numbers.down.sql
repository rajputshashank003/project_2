-- Down migration: no-op since converting NULL back to empty strings is unnecessary and would break unique constraints
SELECT 1;
