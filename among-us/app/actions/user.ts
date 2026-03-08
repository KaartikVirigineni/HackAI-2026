"use server";

import { connectToDatabase, User } from "@/lib/mongodb";

export async function getUserProfile(username: string) {
  try {
    await connectToDatabase();
    
    // Mongoose query
    const user = await User.findOne({ username }).select('username rank points createdAt -_id').lean();
    
    if (!user) {
      return { error: "User not found" };
    }
    
    // Convert lean document to plain JS object if needed, it should already be close.
    return { success: true, user: user as { username: string, rank: string, points: number, createdAt: Date } };
  } catch (error: unknown) {
    console.error("Profile error:", error);
    return { error: "Failed to fetch user profile" };
  }
}

export async function getLeaderboard() {
  try {
    await connectToDatabase();
    
    // Sort by points descending, limit 10
    const leaderboard = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('username rank points -_id')
      .lean();
    
    return { success: true, leaderboard: leaderboard as { username: string, rank: string, points: number }[] };
  } catch (error: unknown) {
    console.error("Leaderboard error:", error);
    return { error: "Failed to fetch leaderboard" };
  }
}
