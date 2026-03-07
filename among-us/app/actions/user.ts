"use server";

import { openDb } from "@/lib/sqlite";

export async function getUserProfile(username: string) {
  try {
    const db = openDb();
    const stmt = db.prepare('SELECT username, rank, points FROM users WHERE username = ?');
    const user = stmt.get(username) as { username: string, rank: string, points: number } | undefined;
    
    if (!user) {
      return { error: "User not found" };
    }
    
    return { success: true, user };
  } catch (error: unknown) {
    console.error("Profile error:", error);
    return { error: "Failed to fetch user profile" };
  }
}

export async function getLeaderboard() {
  try {
    const db = openDb();
    const stmt = db.prepare('SELECT username, rank, points FROM users ORDER BY points DESC LIMIT 10');
    const leaderboard = stmt.all() as { username: string, rank: string, points: number }[];
    
    return { success: true, leaderboard };
  } catch (error: unknown) {
    console.error("Leaderboard error:", error);
    return { error: "Failed to fetch leaderboard" };
  }
}
