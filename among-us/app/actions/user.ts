"use server";

import { connectToDatabase, User } from "@/app/lib/mongodb";

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

export async function updateUserPoints(username: string, earnedPoints: number) {
  try {
    await connectToDatabase();
    
    // Find the user to get current points
    const user = await User.findOne({ username });
    if (!user) {
      return { error: "User not found" };
    }
    
    const newPoints = (user.points || 0) + earnedPoints;
    
    // Calculate new rank
    let newRank = "Recruit";
    if (newPoints >= 50000) newRank = "Ghost Protocol";
    else if (newPoints >= 30000) newRank = "Elite Sentinel";
    else if (newPoints >= 15000) newRank = "Cyber Agent";
    else if (newPoints >= 5000) newRank = "Operative";
    else if (newPoints >= 1000) newRank = "Specialist";
    
    await User.updateOne(
      { username },
      { 
        $set: { 
          points: newPoints,
          rank: newRank
        } 
      }
    );
    
    return { success: true, newPoints, newRank };
  } catch (error: unknown) {
    console.error("Update points error:", error);
    return { error: "Failed to update user points" };
  }
}
