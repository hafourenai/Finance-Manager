const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/transactions', (req, res) => {
  db.query('SELECT * FROM transactions ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/transactions', (req, res) => {
  const { id, type, amount, category, description, date, timestamp } = req.body;
  db.query(
    'INSERT INTO transactions (id, type, amount, category, description, date, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, type, amount, category, description, date, timestamp],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Transaksi ditambahkan', result });
    }
  );
});

app.delete('/transactions/:id', (req, res) => {
  db.query('DELETE FROM transactions WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Transaksi dihapus' });
  });
});

app.put('/transactions/:id', (req, res) => {
  const { type, amount, category, description, date } = req.body;
  db.query(
    'UPDATE transactions SET type=?, amount=?, category=?, description=?, date=? WHERE id=?',
    [type, amount, category, description, date, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Transaksi diperbarui' });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
