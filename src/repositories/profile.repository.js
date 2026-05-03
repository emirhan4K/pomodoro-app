const BaseRepository = require("./base.repository");
const Profile = require("../models/profile.model");

class ProfileRepository extends BaseRepository {
  constructor() {
    super(Profile);
  }

 async updateStats(userId, duration,currentStreak,bestStreak,lastSessionDate) {
    const id = userId?.user || userId?.id || userId;
    return await this.model.findOneAndUpdate(
      { user: id },
      { $inc: { totalPomodoros: 1, totalWorkTime: duration },$set: {currentStreak,bestStreak,lastSessionDate} },
      { new: true, upsert: true }
    );
  }

  async findByUserId(userId) {
    const id = userId?.user || userId?.id || userId;
    if (!id || typeof id === 'object') return null;
    return await this.model.findOne({ user: id });
}
}

module.exports = ProfileRepository;