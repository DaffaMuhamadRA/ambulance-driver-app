-- Add tgl_pulang column to dokumentasi_activity table
-- This column will store the tgl_pulang value from the related ambulan_activity record
ALTER TABLE dokumentasi_activity 
ADD COLUMN IF NOT EXISTS tgl_pulang DATE;

-- Add a comment to explain the purpose of this column
COMMENT ON COLUMN dokumentasi_activity.tgl_pulang IS 'Tanggal pulang from related ambulan_activity record';

-- Create an index for better performance when querying by tgl_pulang
CREATE INDEX IF NOT EXISTS idx_dokumentasi_activity_tgl_pulang ON dokumentasi_activity(tgl_pulang);