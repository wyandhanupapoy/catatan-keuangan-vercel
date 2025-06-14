// File: api/index.js

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // Panggil library 'path' bawaan Node.js

const app = express();

app.use(express.urlencoded({ extended: true }));

// PENTING: Atur lokasi folder 'views' agar bisa ditemukan dari folder 'api'
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Rute utama (Dashboard) - logika tidak berubah
app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC');
    let pemasukan = 0, pengeluaran = 0;
    rows.forEach(t => {
      if (t.tipe === 'pemasukan') pemasukan += parseFloat(t.jumlah);
      else pengeluaran += parseFloat(t.jumlah);
    });
    const saldo = pemasukan - pengeluaran;
    res.render('index', { transaksi: rows, pemasukan, pengeluaran, saldo });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Terjadi kesalahan pada server saat mengambil data.");
  }
});

// Rute tambah transaksi - logika tidak berubah
app.post('/tambah', async (req, res) => {
  try {
    const { deskripsi, jumlah, tipe, tanggal } = req.body;
    await pool.query(
      'INSERT INTO transaksi (deskripsi, jumlah, tipe, tanggal) VALUES ($1, $2, $3, $4)',
      [deskripsi, jumlah, tipe, tanggal]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal menyimpan data.");
  }
});

// PERUBAHAN UTAMA UNTUK VERCEL
// Hapus `app.listen(...)`. Vercel menanganinya secara otomatis.
// Sebagai gantinya, ekspor 'app' agar Vercel bisa menggunakannya.
module.exports = app;