import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import leadsRoutes from "./routes/leads.js"; // ✅ was missing

dotenv.config();

const app = express();

// ── 1. CORS must come FIRST — before express.json() and all routes ────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",       // vite preview
  "https://device360.in",
  "https://www.device360.in",
  "https://device360-hsni.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile, server-to-server)
    if (!origin) return callback(null, true);

    // Allow listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any Vercel / Netlify preview deploy URLs
    if (
      /\.vercel\.app$/.test(origin) ||
      /\.netlify\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200, // IE11 compatibility
};

app.use(cors(corsOptions));

// ── 2. Handle ALL OPTIONS preflight requests ──────────────────────────────────
// This is CRITICAL — browsers send OPTIONS before every POST/PATCH
app.options("*", cors(corsOptions));

// ── 3. Body parsers (after CORS) ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── 4. Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Device360 backend running 🚀" });
});

// ── 5. Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes); // ✅ was missing — caused 404 → CORS failure

// ── 6. 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── 7. Global error handler ───────────────────────────────────────────────────
// Must have 4 params for Express to treat it as error handler
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);

  if (err.message?.includes("CORS")) {
    return res.status(403).json({ error: "CORS error", origin: req.headers.origin });
  }

  res.status(500).json({ error: "Internal server error", message: err.message });
});

// ── 8. Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});