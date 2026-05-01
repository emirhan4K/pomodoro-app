const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı zorunludur'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email zorunludur'],
        unique: true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir email adresi girin']
    },
    password: {
        type: String,
        required: [true, 'Şifre zorunludur'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, 'Şifre zayıf! En az 1 büyük harf, 1 küçük harf ve rakam içermelidir.']
    },
    role:{
        type:String,
        enum : ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: String, //Şifre sıfırlama tokeni
    resetPasswordExpire: Date //Şifre sıfırlama tokeninin geçerlilik süresi
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);