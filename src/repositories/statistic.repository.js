const BaseRepository = require("./base.repository");
const Statistic = require("../models/statistic.model");

class StatisticRepository extends BaseRepository {
  constructor() {
    super(Statistic);
  }

  async incrementStats(userId, duration) {
    return await this.model.findOneAndUpdate(
      { user: userId },
      { 
        $inc: { totalPomodoros: 1, totalWorkTime: duration } 
      },
      { new: true, upsert: true }
    );
  }
}

module.exports = StatisticRepository;