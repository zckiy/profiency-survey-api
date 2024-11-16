const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/insert', (req, res) => {
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
            respondenID: results.insertId
        });
    });
});

module.exports = router;
