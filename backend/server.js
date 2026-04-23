import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev
  "https://device360-hsni.vercel.app" // your frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));