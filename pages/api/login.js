// pages/api/login.js

import { existsSync, readFileSync } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import Cors from "cors";

// CORS middleware
const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*", // za lokalni test, kasnije možeš ograničiti na tvoj domen
});

// Helper za korišćenje CORS-a u Next.js API
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

// Tvoja tajna za JWT (kasnije možeš koristiti env var)
const SECRET_KEY = "supersecret123";

export default async function handler(req, res) {
  // Omogućavamo CORS
  await runMiddleware(req, res, cors);

  // Dozvoljen samo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // Provera "baze" korisnika (users.json)
  const dbPath = path.join(process.cwd(), "users.json");

  if (!existsSync(dbPath)) {
    return res.status(400).json({ error: "No users registered" });
  }

  const users = JSON.parse(readFileSync(dbPath));
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Kreiramo JWT token (vredi 1h)
  const token = jwt.sign({ email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.status(200).json({ message: "Login successful", token });
}
