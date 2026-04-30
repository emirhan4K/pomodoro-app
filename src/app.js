const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
app.use(cors());

//Route Imports

//API Routes

//Global hata yakalayıcı
app.use(errorMiddleware);

module.exports = app;