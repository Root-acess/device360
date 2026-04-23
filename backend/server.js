
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express(); // ✅ MUST BE FIRST

app.use(express.json());

// ✅ CORS FIX
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://device360-hsni.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ YOUR ROUTES (example)
// import authRoutes from "./routes/auth.js";
// app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});