import "dotenv/config";
import express from "express";
import { handleChatRoute } from "../api/chat/route.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/chat", handleChatRoute);

app.listen(port, () => {
  console.log(`NSWCCD backend proxy listening on http://localhost:${port}`);
});
