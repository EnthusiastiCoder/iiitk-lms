import cors from "cors";
import { env } from "./env.js";

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:10000",
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
