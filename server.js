// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// In-memory users
let users = {};
let userCounter = 1;

app.use(express.json());

// Serve static files (css/js/html)
app.use(express.static(path.join(__dirname, "view")));

// --- Serve HTML pages ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "dashboard.html"));
});

// --- REST APIs ---
app.post("/api/register", (req, res) => {
  const id = `user-${userCounter++}`;
  users[id] = { id, registeredAt: Date.now(), ws: null };
  res.json({ id });
});

app.get("/api/users", (req, res) => {
  res.json(Object.values(users).map(u => ({ id: u.id })));
});

app.get("/api/user/:id", (req, res) => {
  const u = users[req.params.id];
  if (!u) return res.status(404).json({ error: "Not found" });
  res.json({ id: u.id, registeredAt: u.registeredAt });
});

// --- WebSocket handling ---
wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "register") {
        const u = users[data.userId];
        if (u) {
          u.ws = ws;
          ws.userId = data.userId;
          console.log(`✅ User registered: ${data.userId}`);
        }
      } 
      else if (data.type === "signal") {
        const target = users[data.target];
        if (target && target.ws) {
          target.ws.send(JSON.stringify({
            type: "signal",
            from: data.from,
            payload: data.payload,
          }));
        }
      }

    } catch (e) {
      console.error("WS message error:", e);
    }
  });

  ws.on("close", () => {
    if (ws.userId && users[ws.userId]) {
      console.log(`❌ User disconnected: ${ws.userId}`);
      // Option 1: only mark ws = null
      users[ws.userId].ws = null;

      // Option 2 (better): delete user
      // delete users[ws.userId];
    }
  });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
