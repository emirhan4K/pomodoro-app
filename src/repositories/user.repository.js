const BaseRepository = require("./base.repository");
const User = require("../models/User.model");

class UserRepository extends BaseRepository{
    constructor(){
        super(User)
    }
}

module.exports = UserRepository;