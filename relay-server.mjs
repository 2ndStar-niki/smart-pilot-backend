import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
app.use(express.json());

// ✅ これを追加
app.get("/", (req, res) => {
  res.status(200).send("TRASS backend alive");
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let latestTelemetry = null;

wss.on("connection", (ws) => {
  console.log("client connected");

  if (latestTelemetry) {
    ws.send(JSON.stringify(latestTelemetry));
  }
});

app.post("/telemetry", (req, res) => {
  latestTelemetry = req.body;

  const msg = JSON.stringify(latestTelemetry);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT is not defined");
}

server.listen(PORT, () => {
  console.log("relay server running on", PORT);
});