const BaseRepository = require("../repositories/base.repository");
const Notification = require("../models/Notification.model");

class NotificationRepository extends BaseRepository{
    constructor(){
        super(Notification)
    }
}

module.exports = NotificationRepository;