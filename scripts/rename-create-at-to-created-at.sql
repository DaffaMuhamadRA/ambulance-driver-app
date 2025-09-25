-- Rename create_at column to created_at in dokumentasi_activity table
ALTER TABLE dokumentasi_activity 
RENAME COLUMN create_at TO created_at;