const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const UserMapper = require("../mappers/user.mapper");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const { generateToken } = require("../utils/jwt.utils");
const { generateOTP, sendEmail } = require("../utils/email.utils");

class AuthService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }
  async register(data) {
    const { username, email, password, passwordConfirm } = data;

    const existingEmail = await this.userRepository.findOne({ email });
    if (existingEmail) {
      throw new BadRequestException("Bu email zaten kayıtlı!");
    }

    const existingUsername = await this.userRepository.findOne({ username });
    if (existingUsername) {
      throw new BadRequestException("Bu kullanıcı adı zaten alınmış!");
    }
    const hashedPassword = await hashPassword(password);
    const user = await this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken({ id: user._id, username: user.username });
    return {
      user: UserMapper.toResponse(user),
      token,
    };
  }
  async login(data) {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("Geçersiz email veya şifre!");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Geçersiz email veya şifre!");
    }
    const token = generateToken({ id: user._id, username: user.username });
    return {
      user: UserMapper.toResponse(user),
      token,
    };
  }
  async forgotPassword(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException("Kullanıcı bulunamadı!");
    }
    const code = generateOTP();
    const expire = new Date(Date.now() + 5 * 60 * 1000);
    await this.userRepository.update(user._id, {
      resetPasswordCode: code,
      resetPasswordExpire: expire,
    });
    await sendEmail({
      email: user.email,
      code: code,
    });

    return { message: "Şifre sıfırlama kodu başarıyla gönderildi." };
  }
  async resetPassword(data){
    const { email, code, newPassword } = data;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException("Kullanıcı bulunamadı!");
    }

    // Kod doğru mu 
    if (user.resetPasswordCode !== code) {
      throw new BadRequestException("Geçersiz veya hatalı kod girdiniz!");
    }

    // 3. Kodun süresi dolmuş mu
    if (Date.now() > user.resetPasswordExpire) {
      throw new BadRequestException("Bu kodun süresi dolmuş! Lütfen yeni bir kod isteyin.");
    }
    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.update(user._id, {
      password: hashedPassword,
      resetPasswordCode: null,   // Güvenlik için kodu siliyoruz
      resetPasswordExpire: null  // Süreyi siliyoruz
    });
    return { message: "Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz." };
  }
}

module.exports = AuthService;
