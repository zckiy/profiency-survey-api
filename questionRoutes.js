const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/insert', (req, res) => {
    try {
        const { surveiID, prodiID, kodePertanyaan, pertanyaan, setAll } = req.body;

        const sql = `INSERT INTO tblpertanyaan (surveiID, prodiID, kodePertanyaan, pertanyaan, setAll) VALUES (?)`;
        const values = [[surveiID, prodiID, kodePertanyaan, pertanyaan, setAll]];

        db.query(sql, values, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                data: results
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/insert-detail', (req, res) => {
    const pertanyaanDetArray = req.body;

    const sql = `INSERT INTO tblpertanyaandetail (pertanyaanID, kodePertanyaanDetail, pertanyaanDetail) VALUES ?`;

    const values = pertanyaanDetArray.map(pertanyaanDet => {
        return [
            pertanyaanDet.pertanyaanID,
            pertanyaanDet.kodePertanyaanDetail,
            pertanyaanDet.pertanyaanDetail
        ];
    });

    db.query(sql, [values], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Pertanyaan berhasil disimpan',
            data: results.affectedRows
        });
    });
});

router.delete('/delete-detail/:pertanyaanDetID', (req, res) => {
    const { pertanyaanDetID } = req.params;

    const sql = `DELETE FROM tblpertanyaandetail WHERE pertanyaanDetID = ?`;

    db.query(sql, [pertanyaanDetID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Detail pertanyaan tidak ditemukan' });
        }

        res.status(200).json({
            message: 'Detail pertanyaan berhasil dihapus',
            data: results.affectedRows
        });
    });
});

module.exports = router;