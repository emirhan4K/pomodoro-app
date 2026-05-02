const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const app = express();
app.use(cors());
app.use(express.json());

// Swagger'ı Başlat
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Route Imports
const authRoutes = require("./routes/auth.routes")
const pomodoroRoutes = require("./routes/pomodoro.routes");
const friendshipRoutes = require("./routes/friendship.routes");
const profileRoutes = require("./routes/profile.routes");

//API Routes
app.use('/api/auth',authRoutes);
app.use('/api/pomodoros', pomodoroRoutes);
app.use('/api/friendships',friendshipRoutes);
app.use('/api/profile',profileRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Global hata yakalayıcı
app.use(errorMiddleware);

module.exports = app;