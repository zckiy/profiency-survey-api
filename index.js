const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Buat koneksi ke database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_survei'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/api/survei/prodiList', (req, res) => {
    const sql = `SELECT * FROM tblprodi`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/survei/surveiList', (req, res) => {
    const sql = `SELECT * FROM tblsurvei`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/survei/pertanyaanList/surveiId=:surveiID&prodiId=:prodiID', (req, res) => {
    const { surveiID, prodiID } = req.params;
    const sql = `SELECT tblpertanyaan.*, tblsurvei.kode as kodeSurvei, tblsurvei.judul 
                 FROM tblpertanyaan
                 LEFT JOIN tblsurvei ON tblpertanyaan.surveiID = tblsurvei.surveiID
                 WHERE tblpertanyaan.surveiID = ? AND (tblpertanyaan.prodiID = ? OR setAll = 1)
                 ORDER BY tblpertanyaan.kodePertanyaan`;

    db.query(sql, [surveiID, prodiID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/survei/pertanyaanDetList/pertanyaanId=:pertanyaanID', (req, res) => {
    const { pertanyaanID } = req.params;
    const sql = `SELECT * FROM tblpertanyaandetail
                 WHERE pertanyaanID = ?`;

    db.query(sql, [pertanyaanID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
})

app.post('/api/responden/insert', (req, res) => {
    const { prodiID, nama, email, tipeRes, tahunLulusan } = req.body;

    if (!prodiID || !nama || !email || !tipeRes) {
        return res.status(400).json({ error: 'Semua data wajib diisi' });
    }

    const tahunDibuat = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO tblresponden (prodiID, nama, email, tipeRes, tahunLulusan, tahunDibuat) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [prodiID, nama, email, tipeRes, tahunLulusan, tahunDibuat], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Data berhasil disimpan',
            data: results,
        });
    });
});
