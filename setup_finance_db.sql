
-- Buat database
CREATE DATABASE IF NOT EXISTS finance_db;
USE finance_db;

-- Buat tabel transaksi
CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT PRIMARY KEY,
  type VARCHAR(50),
  amount DOUBLE,
  category VARCHAR(100),
  description TEXT,
  date DATE,
  timestamp DATETIME
);

-- Tambah beberapa data contoh
INSERT INTO transactions (id, type, amount, category, description, date, timestamp) VALUES
(1001, 'income', 5000000, 'Gaji', 'Gaji bulan Agustus', '2025-08-01', NOW()),
(1002, 'expense', 1500000, 'Belanja', 'Belanja kebutuhan rumah', '2025-08-02', NOW()),
(1003, 'savings', 1000000, 'Tabungan', 'Simpan sebagian ke tabungan', '2025-08-03', NOW());
