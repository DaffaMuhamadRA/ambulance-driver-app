-- Insert sample users for testing
INSERT INTO users (username, email, full_name, password_hash, role, is_active, phone, address, driver_license) 
VALUES 
  ('aep.saepudin', 'aep@citasehat.com', 'Aep Saepudin', '$2b$10$rQJ5qJ5qJ5qJ5qJ5qJ5qJOqJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q', 'driver', true, '081234567890', 'Jl. Sukarajin No. 123', 'B1234567890'),
  ('admin', 'admin@citasehat.com', 'Administrator', '$2b$10$rQJ5qJ5qJ5qJ5qJ5qJ5qJOqJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q', 'admin', true, '081234567891', 'Kantor PT Cita Sehat', NULL)
ON CONFLICT (username) DO NOTHING;

-- Note: Password hash above is for 'password' - in production use proper bcrypt hashing
