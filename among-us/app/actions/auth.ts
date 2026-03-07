"use server";

import { openDb } from "@/lib/sqlite";
import bcrypt from "bcryptjs";

export async function registerAgent(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username || !email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const db = openDb();
    
    // Check if user already exists
    const stmt = db.prepare('SELECT username, email FROM users WHERE username = ? OR email = ?');
    const existingUser = stmt.get(username, email) as { username: string; email: string } | undefined;
    
    if (existingUser) {
      if (existingUser.username === username) {
        return { error: "Username already taken." };
      }
      if (existingUser.email === email) {
        return { error: "Email already registered." };
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    // better-sqlite3 uses sync queries
    const insertStmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    insertStmt.run(username, email, hashedPassword);

    return { success: true };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return { error: "Failed to register agent. Please try again." };
  }
}

export async function loginAgent(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    const db = openDb();

    // Find the user
    const stmt = db.prepare('SELECT username, password FROM users WHERE username = ?');
    const user = stmt.get(username) as { username: string, password: string } | undefined;
    
    if (!user) {
      return { error: "Invalid credentials." };
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Invalid credentials." };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Login error:", error);
    return { error: "Failed to authenticate. Please try again." };
  }
}
