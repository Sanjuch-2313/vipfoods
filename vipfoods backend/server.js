require("dotenv").config();

const express = require("express");
const cors = require("cors");
const net = require("node:net");
const dns = require("node:dns");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 5001;


// ========================================
// CORS - MUST COME BEFORE ROUTES
// ========================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://vipfoods.netlify.app",
      "https://vipfood.in",
      "https://www.vipfood.in",
    ],

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);


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
// BACKEND TEST ROUTE
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VIP Foods Backend API is running",
  });
});


// ========================================
// TEMPORARY GMAIL SMTP CONNECTION TEST
// ========================================
//
// Tests:
//
// Render Backend
//      ↓
// DNS lookup for smtp.gmail.com IPv4
//      ↓
// TCP connection to Gmail port 587
//
// REMOVE THIS ROUTE AFTER DEBUGGING
//
// ========================================

app.get("/api/test-smtp", (req, res) => {
  console.log("=================================");
  console.log("SMTP CONNECTION TEST STARTED");
  console.log("=================================");


  // ----------------------------------------
  // STEP 1: FIND GMAIL IPv4 ADDRESS
  // ----------------------------------------

  dns.lookup(
    "smtp.gmail.com",
    {
      family: 4,
    },

    (dnsError, address) => {

      if (dnsError) {

        console.error(
          "SMTP DNS LOOKUP ERROR:",
          dnsError
        );

        return res.status(500).json({
          success: false,
          stage: "dns",

          message:
            "Unable to resolve smtp.gmail.com",

          error: dnsError.message,
        });
      }


      console.log(
        "Gmail SMTP IPv4 address:",
        address
      );


      // ----------------------------------------
      // STEP 2: CONNECT TO GMAIL PORT 587
      // ----------------------------------------

      const socket = net.createConnection({
        host: address,

        port: 587,

        timeout: 10000,
      });


      let responseSent = false;


      // ----------------------------------------
      // CONNECTION SUCCESSFUL
      // ----------------------------------------

      socket.on("connect", () => {

        if (responseSent) {
          return;
        }


        responseSent = true;


        console.log(
          "SMTP CONNECTION SUCCESSFUL"
        );


        socket.destroy();


        return res.status(200).json({
          success: true,

          stage: "connection",

          message:
            "Backend can connect to Gmail SMTP port 587",

          gmailIPv4: address,
        });
      });


      // ----------------------------------------
      // CONNECTION TIMEOUT
      // ----------------------------------------

      socket.on("timeout", () => {

        if (responseSent) {
          return;
        }


        responseSent = true;


        console.error(
          "SMTP CONNECTION TIMED OUT"
        );


        socket.destroy();


        return res.status(504).json({
          success: false,

          stage: "connection",

          message:
            "Connection to Gmail SMTP port 587 timed out",

          gmailIPv4: address,
        });
      });


      // ----------------------------------------
      // CONNECTION ERROR
      // ----------------------------------------

      socket.on("error", (error) => {

        if (responseSent) {
          return;
        }


        responseSent = true;


        console.error(
          "SMTP CONNECTION ERROR:",
          error
        );


        socket.destroy();


        return res.status(500).json({
          success: false,

          stage: "connection",

          code: error.code,

          message: error.message,

          gmailIPv4: address,
        });
      });
    }
  );
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

    // CONNECT MONGODB

    await connectDB();


    // START EXPRESS SERVER

    app.listen(PORT, () => {

      console.log(
        `Server running on http://localhost:${PORT}`
      );

    });

  } catch (error) {

    console.error(
      "SERVER START ERROR:",
      error
    );


    process.exit(1);
  }
};


startServer();