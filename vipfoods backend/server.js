require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 5001;


// ========================================
// CORS - MUST COME BEFORE ROUTES
// ========================================

app.use(cors({
  origin: ["http://localhost:5173", "https://vipfoods.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


// ========================================
// BODY PARSERS
// ========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "VIP Foods Backend API is running",
  });
});


// ========================================
// AUTH ROUTES
// ========================================

app.use("/api/auth", authRoutes);


// ========================================
// ERROR HANDLER - MUST BE LAST
// ========================================

app.use(errorMiddleware);


// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("SERVER START ERROR:", error);
    process.exit(1);
  }
};

startServer();