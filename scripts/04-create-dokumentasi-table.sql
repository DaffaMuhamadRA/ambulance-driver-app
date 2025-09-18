-- Create dokumentasi_activity table
CREATE TABLE IF NOT EXISTS dokumentasi_activity (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_dokumentasi_activity_activity_id ON dokumentasi_activity(activity_id);
