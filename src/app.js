const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

//Route Imports
const authRoutes = require("./routes/auth.routes")

//API Routes
app.use('/api/auth',authRoutes);

//Global hata yakalayıcı
app.use(errorMiddleware);

module.exports = app;