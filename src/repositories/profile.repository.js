const BaseRepository = require("./base.repository");
const Profile = require("../models/Profile.model");

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
  async followUser(currentUserId, targetUserId) {
    const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
      // 1. Senin 'following' listene onu ekle
      Profile.findOneAndUpdate(
        { user: currentUserId },
        { $addToSet: { following: targetUserId } },
        { new: true },
      ),
      // 2. Onun 'followers' listesine seni ekle
      Profile.findOneAndUpdate(
        { user: targetUserId },
        { $addToSet: { followers: currentUserId } },
        { new: true },
      ),
    ]);

    return updatedCurrentUser;
  }
  async unfollowUser(currentUserId, targetUserId) {
    const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
      // 1. Senin 'following' listenden onu çıkar
      Profile.findOneAndUpdate(
        { user: currentUserId },
        { $pull: { following: targetUserId } },
        { new: true },
      ),
      // 2. Onun 'followers' listesinden seni çıkar
      Profile.findOneAndUpdate(
        { user: targetUserId },
        { $pull: { followers: currentUserId } },
        { new: true },
      ),
    ]);

    return updatedCurrentUser;
  }
  async getFollowersList(userId) {
    const profile = await this.Profile.findOne({ user: userId }).populate({
      path: "followers",
      select: "username avatar title",
    });
    return profile ? profile.followers : [];
  }
  async getFollowingList(userId) {
    const profile = await this.Profile.findOne({ user: userId }).populate({
      path: "following",
      select: "username avatar title",
    });
    return profile ? profile.following : [];
  }
  async searchProfilesByUsername(keyword) {
    if (!keyword) return [];
    // 1.Önce içinde o kelime geçen kullanıcıları bul 
    const matchingUsers = await User.find({
      username: { $regex: keyword, $options: "i" }
    }).select("_id");
    const userIds = matchingUsers.map(user => user._id);
    // 2.Bu kullanıcıların profillerini getir ve populate et
    const profiles = await Profile.find({ user: { $in: userIds } })
      .populate({
        path: "user",
        select: "username" // Sadece username lazım
      });

    return profiles;
  }
}

module.exports = ProfileRepository;
