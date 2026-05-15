import api from "./api";

export const AuthService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

export const ProfileService = {
  getMe: () => api.get(`/profile/me?t=${new Date().getTime()}`),
  searchUsers: (query) => api.get(`/profile/search?q=${query}`),
  getPublicProfile: (userId) => api.get(`/profile/${userId}`),
};

export const TaskService = {
  getTasks: () => api.get("/tasks"),
  createTask: (title) => api.post("/tasks", { title }),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const FollowService = {
  follow: (targetId) => api.post(`/users/${targetId}/follow`),
  unfollow: (targetId) => api.post(`/users/${targetId}/unfollow`),
  getFollowers: (targetId) => api.get(`/users/${targetId}/followers`),
  getFollowing: (targetId) => api.get(`/users/${targetId}/following`),
};

export const BlockService = {
  block: (targetId) => api.post(`/blocks/${targetId}/block`),
  unblock: (targetId) => api.post(`/blocks/${targetId}/unblock`),
  getBlockedList: () => api.get("/blocks/list"),
};

export const NotificationService = {
  getNotifications: () => api.get("/notifications"),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

export const PomodoroService = {
  startSession: (duration, category) =>
    api.post("/pomodoros", { duration, category }),
  updateStatus: (id, status) =>
    api.patch(`/pomodoros/${id}/status`, { status }),
  getHistory: () => api.get("/pomodoros"),
};

export const RoomService = {
  getAllRooms: async () => (await api.get("/rooms")).data,
  getRoomBySlug: async (slug) => {
    const response = await api.get(`/rooms/${slug}`);
    return response.data;
  },
  inviteUser: (roomId, targetUserId) => api.post(`/rooms/${roomId}/invite`, { targetUserId }),
  getRoomMessages: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  createRoom: async (data) => (await api.post("/rooms", data)).data,
  joinRoom: async (id, password) =>
    (await api.post(`/rooms/${id}/join`, { password })).data,
  leaveRoom: async (id) => (await api.post(`/rooms/${id}/leave`)).data,
  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },
};
