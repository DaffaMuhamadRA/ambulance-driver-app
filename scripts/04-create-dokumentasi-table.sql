-- Create dokumentasi_activity table
CREATE TABLE IF NOT EXISTS dokumentasi_activity (
    id SERIAL PRIMARY KEY,
    id_activity INTEGER,
    url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_activity) REFERENCES ambulan_activity(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_dokumentasi_activity_id_activity ON dokumentasi_activity(id_activity);
