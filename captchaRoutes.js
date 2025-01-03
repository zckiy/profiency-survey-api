const express = require('express');
const axios = require('axios');
const router = express.Router();

const RECAPTCHA_SECRET_KEY = '6Lc4tawqAAAAALAz0-871kAZ4kGFzMoIIgwxIL85';

// Endpoint untuk verifikasi CAPTCHA
router.post('/verify-captcha', async (req, res) => {
  const token = req.body.token; // Token dari frontend

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token CAPTCHA tidak ditemukan.' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    const data = response.data;

    if (data.success) {
      return res.status(200).json({ success: true, message: 'CAPTCHA valid.' });
    } else {
      return res.status(400).json({ success: false, message: 'CAPTCHA tidak valid.', errorCodes: data['error-codes'] });
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;