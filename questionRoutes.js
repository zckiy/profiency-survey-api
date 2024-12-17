const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/insert', async (req, res) => {
    try {
        const { surveiID, prodiID, kodePertanyaan, pertanyaan, setAll } = req.body;

        const sql = `INSERT INTO tblpertanyaan (surveiID, prodiID, kodePertanyaan, pertanyaan, setAll) VALUES (?)`;
        const values = [surveiID, prodiID, kodePertanyaan, pertanyaan, setAll];

        const results = await queryDatabase(sql, [values]);
        res.status(201).json({ data: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/insert-detail', async (req, res) => {
    try {
        const pertanyaanDetArray = req.body;

        const sql = `INSERT INTO tblpertanyaandetail (pertanyaanID, kodePertanyaanDetail, pertanyaanDetail) VALUES ?`;

        const values = pertanyaanDetArray.map(pertanyaanDet => [
            pertanyaanDet.pertanyaanID,
            pertanyaanDet.kodePertanyaanDetail,
            pertanyaanDet.pertanyaanDetail
        ]);

        const results = await queryDatabase(sql, [values]);
        res.status(201).json({
            message: 'Pertanyaan berhasil disimpan',
            data: results.affectedRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/delete-detail/:pertanyaanDetID', async (req, res) => {
    try {
        const { pertanyaanDetID } = req.params;

        const sql = `DELETE FROM tblpertanyaandetail WHERE pertanyaanDetID = ?`;
        const results = await queryDatabase(sql, [pertanyaanDetID]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Detail pertanyaan tidak ditemukan' });
        }

        res.status(200).json({
            message: 'Detail pertanyaan berhasil dihapus',
            data: results.affectedRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/delete/:pertanyaanID', async (req, res) => {
    try {
        const { pertanyaanID } = req.params;

        // Ambil pertanyaanDetID terkait
        const pertanyaanDetIDs = await getPertanyaanDetIDs(pertanyaanID);

        // Hapus data terkait secara berurutan
        if (pertanyaanDetIDs.length > 0) {
            await deleteJawabanDet(pertanyaanDetIDs);
        }
        await deleteJawaban(pertanyaanID);
        await deleteDetail(pertanyaanID);

        const sql = `DELETE FROM tblpertanyaan WHERE pertanyaanID = ?`;
        const results = await queryDatabase(sql, [pertanyaanID]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
        }

        res.status(200).json({
            message: 'Pertanyaan berhasil dihapus',
            data: results.affectedRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

async function getPertanyaanDetIDs(pertanyaanID) {
    const sql = `SELECT pertanyaanDetID FROM tblpertanyaandetail WHERE pertanyaanID = ?`;
    const results = await queryDatabase(sql, [pertanyaanID]);
    return results.map(row => row.pertanyaanDetID);
}

async function deleteDetail(pertanyaanID) {
    const sql = `DELETE FROM tblpertanyaandetail WHERE pertanyaanID = ?`;
    return await queryDatabase(sql, [pertanyaanID]);
}

async function deleteJawaban(pertanyaanID) {
    const sql = `DELETE FROM tbljawaban WHERE pertanyaanID = ?`;
    return await queryDatabase(sql, [pertanyaanID]);
}

async function deleteJawabanDet(pertanyaanDetIDs) {
    const sql = `DELETE FROM tbljawabandetail WHERE pertanyaanDetID IN (?)`;
    return await queryDatabase(sql, [pertanyaanDetIDs]);
}

function queryDatabase(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

module.exports = router;