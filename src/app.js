const express = require("express");
const cors = require("cors");
const path = require('path');
const errorMiddleware = require("./middlewares/error.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://odaklan-app.vercel.app',
    'https://pomodoro-app-nu-blush.vercel.app' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], 
  credentials: true,
  optionsSuccessStatus: 200 
}));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Swagger'ı Başlat
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Route Imports
const authRoutes = require("./routes/auth.routes")
const pomodoroRoutes = require("./routes/pomodoro.routes");
const friendshipRoutes = require("./routes/friendship.routes");
const profileRoutes = require("./routes/profile.routes");
const taskRoutes = require("./routes/task.routes");
const roomRoutes = require("./routes/room.routes");
const followRoutes = require("./routes/follow.routes");

//API Routes
app.use('/api/auth',authRoutes);
app.use('/api/pomodoros', pomodoroRoutes);
app.use('/api/friendships',friendshipRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/rooms',roomRoutes)
app.use('/api/users',followRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Global hata yakalayıcı
app.use(errorMiddleware);

module.exports = app;