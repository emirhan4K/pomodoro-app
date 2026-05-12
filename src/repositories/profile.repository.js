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
    const profile = await this.model.findOne({ user: userId });
    if (!profile || !profile.followers || profile.followers.length === 0)
      return [];
    return await this.model
      .find({ user: { $in: profile.followers } })
      .populate("user");
  }
  async getFollowingList(userId) {
    const profile = await this.model.findOne({ user: userId });
    if (!profile || !profile.following || profile.following.length === 0)
      return [];
    return await this.model
      .find({ user: { $in: profile.following } })
      .populate("user");
  }
  async searchProfilesByUsername(keyword) {
    if (!keyword) return [];
    return await this.model.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.username": { $regex: keyword, $options: "i" },
        },
      },
      {
        $project: {
          "user.password": 0,
          "user.email": 0,
        },
      },
    ]);
  }
  async blockUser(currentUserId, targetUserId) {   //Birini engelle listesine ekle
    return await this.model.findOneAndUpdate(
      { user: currentUserId },
      { $addToSet: { blockedUsers: targetUserId } }, 
      { new: true }
    );
  }
  async unblockUser(currentUserId, targetUserId) {   //Birini engelle listesinden çıkar
    return await this.model.findOneAndUpdate(
      { user: currentUserId },
      { $pull: { blockedUsers: targetUserId } }, 
      { new: true }
    );
  }
}

module.exports = ProfileRepository;
