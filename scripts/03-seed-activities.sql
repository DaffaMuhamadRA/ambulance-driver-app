-- Insert sample activities data
INSERT INTO activities (
  tgl_berangkat, tgl_pulang, detail, dari, tujuan, 
  jam_berangkat, jam_pulang, tipe, reward, ambulance_id, user_id
) VALUES 
  ('2025-09-13', '2025-09-13', 'Jenazah', 'Jl Sukarajin', 'Tpu Cikutra', '09:00:00', '10:30:00', 'Jam Pengantaran 08.00 - 16.00', 0, 1, 1),
  ('2025-09-12', '2025-09-12', 'Pasien', 'RSHS', 'Jl BBK Sari', '16:30:00', '17:45:00', 'Jam Pengantaran 16.00 - 22.00', 40000, 1, 1),
  ('2025-09-12', '2025-09-12', 'Pasien', 'Jl Bbk sari 1', 'RSHS', '07:45:00', '08:30:00', 'Jam Pengantaran 08.00 - 16.00', 0, 1, 1),
  ('2025-09-11', '2025-09-11', 'Jenazah', 'RS Edelweiss', 'Jl Baturaden 2', '13:00:00', '14:00:00', 'Jam Pengantaran 08.00 - 16.00', 0, 1, 1),
  ('2025-09-14', '2025-09-14', 'Siaga Sehat', 'Posko Kesehatan', 'Event Car Free Day Dago', '07:00:00', '11:00:00', 'Event Kesehatan', 0, 1, 1),
  ('2025-09-11', '2025-09-11', 'Jenazah', 'Sekeloa', 'Tpu Cikutra', '09:00:00', '10:30:00', 'Jam Pengantaran 08.00 - 16.00', 0, 1, 1),
  ('2025-09-09', '2025-09-09', 'Jenazah', 'Samoja', 'Tpu Cadas ngampar soreang', '14:30:00', '18:30:00', 'Jam Pengantaran 08.00 - 16.00', 0, 1, 1),
  ('2025-09-08', '2025-09-08', 'Pasien', 'RS pindad', 'Gg anta baru', '18:30:00', '20:30:00', 'Jam Pengantaran 16.00 - 22.00', 40000, 1, 1)
ON CONFLICT DO NOTHING;

-- Insert sample ambulances data
INSERT INTO ambulances (nopol, kode, is_active) VALUES 
  ('D 1583', 'AHK', true),
  ('D 1234', 'XYZ', true),
  ('D 5678', 'ABC', true)
ON CONFLICT DO NOTHING;
