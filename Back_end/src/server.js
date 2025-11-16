const dotenv = require("dotenv");
const express = require("express");
const { connectDB } = require("./config/db.js");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Preflight (Express 5 safe)
// SAFE preflight handler for Express 5
app.options(/.*/, cors());

connectDB();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
app.use(helmet());

// ROUTES
const userRoutes = require("./modules/user/user.route.js");
const authRoutes = require("./modules/Authentification/auth.routes.js");

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

// START SERVER
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
