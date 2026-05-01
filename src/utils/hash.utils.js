const bcrypt = require('bcryptjs');

const hashPassword = async (password) => { //Şifre hashleme fonksiyonu
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => { //Şifre karşılaştırma fonksiyonu
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };