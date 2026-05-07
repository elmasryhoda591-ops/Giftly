import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const DB_FILE = path.join(process.cwd(), "database.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Simple file-based JSON DB
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { gifts: {} };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/uploads", express.static(UPLOADS_DIR));

  // API Routes
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  app.post("/api/gifts", (req, res) => {
    try {
      const db = readDB();
      const id = uuidv4();
      db.gifts[id] = { ...req.body, id, createdAt: new Date().toISOString() };
      writeDB(db);
      res.json({ id });
    } catch (e) {
      res.status(500).json({ error: "Failed to create gift" });
    }
  });

  app.get("/api/gifts/:id", (req, res) => {
    try {
      const db = readDB();
      const gift = db.gifts[req.params.id];
      if (gift) {
        res.json(gift);
      } else {
        res.status(404).json({ error: "Gift not found" });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to read gift" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
