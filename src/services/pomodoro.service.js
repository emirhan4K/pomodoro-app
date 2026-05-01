const BadRequestException = require("../exceptions/BadRequestException");
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const PomodoroMapper = require("../mappers/pomodoro.mapper");

class PomodoroService{
    constructor({pomodoroRepository}){
        this.pomodoroRepository = pomodoroRepository;
    }
    async createSession(userId, bodyData){
        const {category,duration} = bodyData;

        const newSession  = await this.pomodoroRepository.create({
            user:userId,
            duration,
            category
        })
        return {newSession:PomodoroMapper.toResponse(newSession)}
    };
    async updateSessionStatus(sessionId, userId, status){
        const session = await this.pomodoroRepository.findById(sessionId);
        if(!session){
            throw new BadRequestException("Pomodoro bulunamadı!")
        }
        if(session.user.toString() !== userId.toString()){
            throw new UnauthorizedException("Bu oturumu değiştiremezsiniz.")
        }
        const updatedSession = await this.pomodoroRepository.update(sessionId,{
            status,
        })
        return {updatedSession:PomodoroMapper.toResponse(updatedSession)};
    }
}

module.exports = PomodoroService;