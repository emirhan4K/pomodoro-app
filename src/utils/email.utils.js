const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 1. Rastgele 6 Haneli Kod Üretme Fonksiyonu
const generateOTP = () => {
    // 100000 ile 999999 arasında güvenli bir sayı üretir
    return crypto.randomInt(100000, 999999).toString();
};

// 2. Mail Gönderme Motoru (Nodemailer Yapılandırması)
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: 'Odaklan <noreply@odaklan.com>',
        to: options.email,
        subject: 'Şifre Sıfırlama Kodu',
        text: `Şifre sıfırlama kodunuz: ${options.code}. Bu kod 5 dakika geçerlidir.`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendEmail };