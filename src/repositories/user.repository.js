const BaseRepository = require("./base.repository");
const User = require("../models/User.model");

class UserRepository extends BaseRepository{
    constructor(){
        super(User)
    }
    async findByEmail(email){
        return this.findOne({ email });
    }
}

module.exports = UserRepository;