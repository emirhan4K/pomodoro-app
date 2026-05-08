import api from "./api"; // Senin halihazırda var olan o güzel dosyan!

export const AuthService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

export const ProfileService = {
  getMe: () => api.get(`/profile/me?t=${new Date().getTime()}`),
};

export const TaskService = {
  getTasks: () => api.get("/tasks"),
  createTask: (title) => api.post("/tasks", { title }),
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
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
  createRoom: async (data) => (await api.post("/rooms", data)).data,
  joinRoom: async (id, password) =>
    (await api.post(`/rooms/${id}/join`, { password })).data,
  leaveRoom: async (id) => (await api.post(`/rooms/${id}/leave`)).data,
  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },
};
