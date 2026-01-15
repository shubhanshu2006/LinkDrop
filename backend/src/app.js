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
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes imports
import healthCheckRoute from "./routes/healthcheck.route.js";
import fileRoute from "./routes/file.routes.js";
import authRoute from "./routes/auth.routes.js";

// routes
app.use("/api/v1/files", fileRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/healthcheck", healthCheckRoute);

export { app };
