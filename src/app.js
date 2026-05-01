const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

//Route Imports
const authRoutes = require("./routes/auth.routes")
const pomodoroRoutes = require("./routes/pomodoro.routes");
const friendshipRoutes = require("./routes/friendship.routes");

//API Routes
app.use('/api/auth',authRoutes);
app.use('/api/pomodoros', pomodoroRoutes);
app.use('/api/friendships',friendshipRoutes);

//Global hata yakalayıcı
app.use(errorMiddleware);

module.exports = app;