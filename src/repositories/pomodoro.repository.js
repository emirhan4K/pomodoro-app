const BaseRepository = require("./base.repository");
const Pomodoro = require("../models/Pomodoro.model");

class PomodoroRepository extends BaseRepository{
    constructor(){
        super(Pomodoro)
    }
   async getUserHistory(userId){ //Geçmiş pomodoroları getir
    return await this.model.find({
        user:userId
    }).sort({ createdAt: -1 })
   }
}

module.exports = PomodoroRepository;