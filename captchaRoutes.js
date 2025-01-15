const express = require('express');
const axios = require('axios');
const router = express.Router();

const RECAPTCHA_SECRET_KEY = '6Lc4tawqAAAAALAz0-871kAZ4kGFzMoIIgwxIL85';

// Endpoint untuk verifikasi CAPTCHA
router.post('/verify-captcha', async (req, res) => {
  const token = req.body.token;

  if (!token || typeof token !== 'string' || token.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Token CAPTCHA tidak valid.' });
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
        timeout: 5000,
      }
    );

    const data = response.data;

    if (data.success) {
      return res.status(200).json({ success: true, message: 'CAPTCHA valid.' });
    } else {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA tidak valid.',
        errorCodes: data['error-codes'],
      });
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error.message);
    return res.status(500).json({ success: false, message: 'Kesalahan server.' });
  }
});


module.exports = router;