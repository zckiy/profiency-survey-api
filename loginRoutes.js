const express = require('express');
const router = express.Router();
const db = require('./db');

// Route untuk autentikasi admin dengan username dan password
router.get('/LoginAdmin/username=:username&password=:password', (req, res) => {
    const { username, password } = req.params;

    const sql = `SELECT COUNT(*) as userCount FROM tbluser WHERE username = ? AND password = ?`;

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results[0].userCount > 0) {
            return res.status(200).json({ success: true, message: "Login berhasil" });
        } else {
            return res.status(401).json({ success: false, message: "Username atau password salah" });
        }
    });
});

module.exports = router;