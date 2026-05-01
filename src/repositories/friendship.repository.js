const BaseRepository = require("./base.repository");
const Friendship = require("../models/Friendship.model");

class FriendshipRepository extends BaseRepository{
    constructor(){
        super(Friendship)
    }
}

module.exports = FriendshipRepository;