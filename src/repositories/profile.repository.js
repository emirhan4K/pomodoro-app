const BaseRepository = require("./base.repository");
const Profile = require("../models/profile.model");

class ProfileRepository extends BaseRepository {
  constructor() {
    super(Profile);
  }

  async updateStats(
    userId,
    duration,
    currentStreak,
    bestStreak,
    lastSessionDate,
  ) {
    const id = userId?.toString() || userId;
    const addedHours = Number(duration) / 60;

    return await this.model.findOneAndUpdate(
      { user: id },
      {
        $inc: {
          totalPomodoros: 1,
          totalWorkTime: addedHours,
        },
        $set: {
          currentStreak: Number(currentStreak),
          bestStreak: Number(bestStreak),
          lastSessionDate: lastSessionDate,
        },
      },
      { new: true, upsert: true },
    );
  }

  async findByUserId(userId) {
    const id = userId?.user || userId?.id || userId;
    if (!id) return null;
    return await this.model.findOne({ user: id });
  }
}

module.exports = ProfileRepository;
