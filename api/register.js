// pages/api/register.js

import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import Cors from "cors";

// CORS middleware
const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*",
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const dbPath = path.join(process.cwd(), "users.json");

  // Ako fajl ne postoji, kreiraj prazan array
  let users = [];
  if (existsSync(dbPath)) {
    users = JSON.parse(readFileSync(dbPath));
  }

  // Proveri da li korisnik već postoji
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Dodaj novog korisnika
  users.push({ email, password });
  writeFileSync(dbPath, JSON.stringify(users, null, 2));

  res.status(201).json({ message: "User registered successfully" });
}
