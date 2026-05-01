const BaseRepository = require("./base.repository");
const Profile = require("../models/profile.model");

class ProfileRepository extends BaseRepository {
  constructor() {
    super(Profile);
  }

  async updateStats(userId, duration) {
    return await this.model.findOneAndUpdate(
      { user: userId },
      { $inc: { totalPomodoros: 1, totalWorkTime: duration } },
      { new: true, upsert: true }
    );
  }

  async findByUserId(userId) {
    return await this.model.findOne({ user: userId });
  }
}

module.exports = ProfileRepository;