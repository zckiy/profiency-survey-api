const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/data-diagram', async (req, res) => {
    try {
        const prodiList = await getProdi(); // Ambil daftar prodi
        const tipeResList = await getTipeRes(); // Ambil daftar tipeRes
        const resultData = {};

        // Iterasi setiap prodi
        for (const prodi of prodiList) {
            const pertanyaanIDs = await getPertanyaanID(prodi.prodiID); // Pertanyaan untuk setiap prodi
            const kodePertanyaan = await getKodePertanyaan(prodi.prodiID); // Ambil kode pertanyaan dari ID
            
            const datasets = [];
            // Iterasi setiap tipeRes untuk menghasilkan dataset
            for (const tipeRes of tipeResList) {
                const avgJawaban = await Promise.all(
                    pertanyaanIDs.map((pertanyaanID) => getAVGJawaban(pertanyaanID, tipeRes.tipeResID, prodi.prodiID))
                );
                datasets.push({
                    tipeRes: tipeRes.tipeRes,
                    avgJawaban: avgJawaban.flat(),
                    bgColor: tipeRes.bgColor // Hasilkan data rata-rata
                });
            }

            resultData[prodi.prodiID] = {
                namaProdi: prodi.namaProdi,
                kodePertanyaan,
                datasets
            };
        }

        res.json(resultData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Fungsi untuk mendapatkan daftar prodi
function getProdi() {
    const query = `SELECT prodiID, namaProdi FROM tblprodi`;
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

function getTipeRes() {
    const query = `SELECT * FROM tbltiperesponden;`;
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                return reject(err);
            }
            // Perbaiki map untuk mengembalikan objek
            resolve(results.map((row) => ({
                tipeResID: row.tipeResID,
                tipeRes: row.tipeRes,
                bgColor: row.bgColor
            })));
        });
    });
}

// Fungsi untuk mendapatkan pertanyaan ID
function getPertanyaanID(prodiID) {
    const query = `
        SELECT pertanyaanID 
        FROM tblpertanyaan
        WHERE prodiID = ? OR setAll = 1
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [prodiID], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.map((row) => row.pertanyaanID));
        });
    });
}

function getKodePertanyaan(prodiID) {
    const query = `
        SELECT kodePertanyaan 
        FROM tblpertanyaan
        WHERE prodiID = ? OR setAll = 1
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [prodiID], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.map((row) => row.kodePertanyaan));
        });
    });
}

// Fungsi untuk mendapatkan rata-rata jawaban
function getAVGJawaban(pertanyaanID, tipeResID, prodiID) {
    const query = `
        SELECT IFNULL(AVG(tbljawaban.jawabanNUM), 0) AS avgJawaban
        FROM tbljawaban
        INNER JOIN tblresponden ON tbljawaban.respondenID = tblresponden.respondenID
        WHERE tbljawaban.pertanyaanID = ? AND tblresponden.tipeResID = ? AND tbljawaban.prodiID = ?;
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [pertanyaanID, tipeResID, prodiID], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.map((row) => row.avgJawaban));
        });
    });
}

module.exports = router;