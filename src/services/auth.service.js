const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const UserMapper = require("../mappers/user.mapper");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const { generateToken } = require("../utils/jwt.utils");

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
}

module.exports = AuthService;
