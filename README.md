# FinanceFlow V 1

Selamat datang di **FinanceFlow**, solusi manajemen keuangan pribadi yang mencakup aplikasi web, aplikasi mobile, dan backend API yang terintegrasi. Proyek ini dirancang untuk memudahkan pencatatan pemasukan, pengeluaran, dan tabungan Anda di berbagai platform.

---

## Tech Stack

### Mobile App (Flutter)
- **Framework:** Flutter ![Flutter](https://img.shields.io/badge/-Flutter-02569B?style=flat-square&logo=flutter&logoColor=white)
- **Database Lokal:** SQLite ![SQLite](https://img.shields.io/badge/-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
- **Fitur Utama:** Dashboard, Riwayat Transaksi, Laporan Grafik (`fl_chart`), dan Ekspor Laporan TXT.
- **Library Penting:** `share_plus` (berbagi laporan), `intl` (format uang & tanggal Indonesia).

### Web Frontend (React)
- **Framework:** React ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black)
- **Styling:** Tailwind CSS![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)
- **Database Lokal:** Dexie.js ![Dexie.js](https://img.shields.io/badge/Dexie.js-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
- **Visualisasi:** `Recharts`

### Backend API (Node.js)
- **Runtime:** Node.js ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
- **Framework:** Express ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white)
- **Database:** MySQL ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
- **Security & Config:** `cors`, `dotenv`

---

## Installation

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- [Flutter SDK](https://docs.flutter.dev/get-started/install)
- [Node.js](https://nodejs.org/)
- [MySQL](https://dev.mysql.com/downloads/installer/) atau XAMPP/MariaDB

### 2. Setup Database
1. Buka MySQL client Anda (misal: phpMyAdmin atau MySQL Workbench).
2. Jalankan perintah SQL yang ada di file `setup_finance_db.sql` di root proyek untuk membuat database dan tabel yang diperlukan.

### 3. Setup Backend
1. Masuk ke folder: `cd backend/finance-api`
2. Instal dependensi: `npm install`
3. Buat file `.env` (isi sesuai database Anda):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=finance_db
   PORT=5000
   ```
4. Jalankan server: `npm start`

### 4. Setup Frontend (Web)
1. Masuk ke folder: `cd frontend`
2. Instal dependensi: `npm install`
3. Jalankan aplikasi: `npm start`
4. Buka [http://localhost:3000](http://localhost:3000)

### 5. Setup Flutter (Mobile)
1. Masuk ke folder: `cd flutter_app`
2. Ambil dependensi: `flutter pub get`
3. Jalankan di perangkat/emulator: `flutter run`
4. Untuk build APK: `flutter build apk --release`

---

## If u have any doubt

### Apakah Aplikasi Ini Aman?
**YA, aplikasi ini aman.** Aplikasi ini adalah alat manajemen data (CRUD) standar. Data disimpan di database lokal (`sqflite` di Mobile, `Dexie` di Web) atau di database MySQL milik Anda sendiri melalui Backend API.

### Apakah Ini Trojan atau Malware?
- **Tidak ada Trojan:** Aku tidak menulis kode tersembunyi yang mencoba mencuri informasi sistem atau menyisipkan file berbahaya.
- **Tidak ada Pembajakan:** Aku tidak menulis kode yang mencoba mengakses browser, file pribadi di luar folder database, atau kamera/mikrofon tanpa izin.
- **Transparansi:** Semua library yang digunakan adalah library open-source populer yang dipercaya oleh komunitas developer global (seperti `sqflite`, `express`, `react`, dll).
- **Koneksi Jaringan:** Satu-satunya koneksi jaringan eksternal adalah antara frontend/mobile ke backend API lokal Anda sendiri untuk sinkronisasi data.

**Kesimpulan:** Aplikasi ini murni merupakan alat produktivitas keuangan dan tidak memiliki fungsionalitas yang membahayakan perangkat Anda.

---
*Dibuat dengan ❤️ oleh Hafourenai*
