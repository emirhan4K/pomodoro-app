const BaseRepository = require("./base.repository");
const Pomodoro = require("../models/Pomodoro.model");

class PomodoroRepository extends BaseRepository{
    constructor(){
        super(Pomodoro)
    }
}

module.exports = PomodoroRepository;