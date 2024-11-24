const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/list-prodi', (req, res) => {
    const sql = `
        SELECT tblprodi.prodiID, tblprodi.namaProdi, tbljurusan.jurusanID, tbljurusan.namaJurusan
        FROM tblprodi
        LEFT JOIN tbljurusan ON tblprodi.jurusanID = tbljurusan.jurusanID
    `;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
 
router.get('/list-survei', (req, res) => {
    const sql = `SELECT * FROM tblsurvei`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.get('/list-pertanyaan/surveiId=:surveiID&prodiId=:prodiID', (req, res) => {
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

router.get('/list-pertanyaandet/pertanyaanId=:pertanyaanID', (req, res) => {
    const { pertanyaanID } = req.params;
    const sql = `SELECT * FROM tblpertanyaandetail
                 WHERE pertanyaanID = ?`;
    db.query(sql, [pertanyaanID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.post('/insert-jawaban', (req, res) => {
    const jawabanArray = req.body;
    const tanggalDibuat = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO tbljawaban (respondenID, prodiID, pertanyaanID, jawabanNUM, jawabanSTR, tanggalDibuat) VALUES ?`;

    const values = jawabanArray.map(jawaban => [
        jawaban.respondenID,
        jawaban.prodiID,
        jawaban.pertanyaanID,
        jawaban.jawabanNUM,
        jawaban.jawabanSTR,
        tanggalDibuat
    ]);

    db.query(sql, [values], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Data berhasil disimpan',
            data: results.affectedRows
        });
    });
});

router.post('/insert-jawabandet', (req, res) => {
    const jawabanDetArray = req.body;

    // Validasi array
    if (!Array.isArray(jawabanDetArray) || jawabanDetArray.length === 0) {
        return res.status(400).json({ error: "Payload tidak valid atau kosong" });
    }

    const tanggalDibuat = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO tbljawabandetail (pertanyaanDetID, prodiID, respondenID, jawabanDet, tanggalDibuat) VALUES ?`;

    const values = jawabanDetArray.map(jawabanDet => {
        if (
            typeof jawabanDet.pertanyaanDetID !== 'number' ||
            typeof jawabanDet.respondenID !== 'number' ||
            typeof jawabanDet.jawabanDet !== 'number'
        ) {
            res.status(400).json({ error: "Data tidak sesuai tipe yang diharapkan" });
            throw new Error("Data tidak valid");
        }

        return [
            jawabanDet.pertanyaanDetID,
            jawabanDet.prodiID,
            jawabanDet.respondenID,
            jawabanDet.jawabanDet,
            tanggalDibuat
        ];
    });

    db.query(sql, [values], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Data berhasil disimpan',
            data: results.affectedRows
        });
    });
});

module.exports = router;
