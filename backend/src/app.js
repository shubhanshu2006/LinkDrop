import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes imports
import healthCheckRoute from "./routes/healthcheck.route.js";
import fileRoute from "./routes/file.routes.js";
import authRoute from "./routes/auth.routes.js";
import adminRoute from "./routes/admin.routes.js";

// routes
app.use("/api/v1/files", fileRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/healthcheck", healthCheckRoute);
app.use("/api/v1/admin", adminRoute);

export { app };
