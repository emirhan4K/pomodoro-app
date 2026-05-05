const BaseRepository = require("./base.repository");
const Room = require("../models/Room.model");

class RoomRepository extends BaseRepository{
    constructor(){
        super(Room)
    }
    
}