import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

// __dirname resolve karna (ESM me directly available nahi hota)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// "pr" folder ko static bana do
app.use(express.static(path.join(__dirname, "pr")));

// Root route -> index.html serve karega
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pr", "index.html"));
});

// Agar direct /dashboard hit kare to
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "pr", "dashboard.html"));
});

// Agar direct /capture hit kare to
app.get("/capture", (req, res) => {
  res.sendFile(path.join(__dirname, "pr", "capture.html"));
});

// Agar direct /view hit kare to
app.get("/view", (req, res) => {
  res.sendFile(path.join(__dirname, "pr", "view.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
