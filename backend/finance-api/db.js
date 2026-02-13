require("dotenv").config(); // tambahkan ini di baris pertama
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // penting untuk MariaDB custom port
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Gagal konek ke database:", err);
    return;
  }
  console.log("Berhasil terkoneksi ke database");
});

module.exports = connection;
