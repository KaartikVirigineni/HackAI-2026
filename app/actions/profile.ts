"use server";

import { connectToDatabase, User } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

export async function updateUsername(oldUsername: string, newUsername: string) {
  if (!oldUsername || !newUsername) {
    return { error: "Both current and new username are required." };
  }

  if (oldUsername === newUsername) {
    return { error: "New username must be different from the current one." };
  }

  try {
    await connectToDatabase();
    
    // Check if new username is already taken
    const existingUser = await User.findOne({ username: newUsername }).select('_id').lean();
    
    if (existingUser) {
      return { error: "Username already taken." };
    }

    // Update username
    const result = await User.updateOne({ username: oldUsername }, { username: newUsername });
    
    if (result.matchedCount === 0) {
      return { error: "User not found." };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Update username error:", error);
    return { error: "Failed to update username. Please try again." };
  }
}

export async function updateEmail(username: string, currentPassword: string, newEmail: string) {
  if (!username || !currentPassword || !newEmail) {
    return { error: "All fields are required." };
  }

  try {
    await connectToDatabase();

    // Verify user and password
    const user = await User.findOne({ username }).select('password').lean() as { password: string } | null;

    if (!user) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password." };
    }

    // Check if new email is already used
    const existingEmail = await User.findOne({ email: newEmail }).select('_id').lean();
    
    if (existingEmail) {
      return { error: "Email already registered." };
    }

    // Update email
    await User.updateOne({ username }, { email: newEmail });

    return { success: true };
  } catch (error: unknown) {
    console.error("Update email error:", error);
    return { error: "Failed to update email. Please try again." };
  }
}

export async function updatePassword(username: string, currentPassword: string, newPassword: string) {
  if (!username || !currentPassword || !newPassword) {
    return { error: "All fields are required." };
  }

  try {
    await connectToDatabase();

    // Verify user and current password
    const user = await User.findOne({ username }).select('password').lean() as { password: string } | null;

    if (!user) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password." };
    }

    // Hash the new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ username }, { password: hashedNewPassword });

    return { success: true };
  } catch (error: unknown) {
    console.error("Update password error:", error);
    return { error: "Failed to update password. Please try again." };
  }
}

export async function deleteAccount(username: string, currentPassword: string) {
  if (!username || !currentPassword) {
    return { error: "All fields are required." };
  }

  try {
    await connectToDatabase();

    // Verify user and password
    const user = await User.findOne({ username }).select('password').lean() as { password: string } | null;

    if (!user) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password." };
    }

    // Delete user
    await User.deleteOne({ username });

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account. Please try again." };
  }
}
