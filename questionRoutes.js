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

module.exports = router;