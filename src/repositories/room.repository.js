const BaseRepository = require("./base.repository");
const Rooms = require("../models/Room.model");

class RoomRepository extends BaseRepository{
    constructor(){
        super(Rooms)
    }
}

module.exports = RoomRepository;
