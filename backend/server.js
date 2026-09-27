import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import communityRouter from "./routes/communityRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import { stripeWebhook } from "./controllers/paymentsController.js";

const PORT = process.env.PORT || 4000;
const app = express();
const corsOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://web-builder-frontend.onrender.com",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

// Middleware
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);
app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/community", communityRouter);
app.use("/api/payments", paymentRouter);

app.get("/", (req, res) => {
  res.send("API working");
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error(`[api] ${req.method} ${req.originalUrl}`, err.stack || err);
  const status = Number(err.statusCode || err.status) || 500;
  const error =
    process.env.NODE_ENV === "production" && status >= 500
      ? "The server could not complete this request. Check the backend logs."
      : err.message || "Internal server error";

  res.status(status).json({ error });
});

try {
  await connectDB();
  app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server Running on PORT ${PORT}`);
  });
} catch (err) {
  console.error("Backend startup failed:", err.message);
  process.exitCode = 1;
}