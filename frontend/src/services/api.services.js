import api from './api'; // Senin halihazırda var olan o güzel dosyan!

export const AuthService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const ProfileService = {
  getMe: () => api.get('/profile/me'),
};

export const TaskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (title) => api.post('/tasks', { title }),
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const PomodoroService = {
  startSession: (duration, category) => api.post('/pomodoros', { duration, category }),
  updateStatus: (id, status) => api.patch(`/pomodoros/${id}/status`, { status }),
  getHistory: () => api.get('/pomodoros'),
};