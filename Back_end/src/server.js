const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/db.js");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

dotenv.config();
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available globally for use in other modules
global.io = io;

app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Preflight (Express 5 safe)
// SAFE preflight handler for Express 5
app.options(/.*/, cors());

connectDB().then(() => {
  seedProducts();
});

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
const productRoutes = require("./modules/product/product.route.js");
const { seedProducts } = require("./modules/product/product.seed");

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);

// Periodic task to check and update online status
const { checkAndUpdateOnlineStatus } = require('./services/statusTracker');
setInterval(() => {
  checkAndUpdateOnlineStatus();
}, 5 * 60 * 1000); // Check every 5 minutes

// Socket.io connection handling
io.on('connection', (socket) => {
  

  socket.on('disconnect', () => {
    
  });
});

// START SERVER
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
