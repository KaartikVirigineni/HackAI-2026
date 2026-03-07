"use server";

import { openDb } from "@/lib/sqlite";
import bcrypt from "bcryptjs";

export async function updateUsername(oldUsername: string, newUsername: string) {
  if (!oldUsername || !newUsername) {
    return { error: "Both current and new username are required." };
  }

  if (oldUsername === newUsername) {
    return { error: "New username must be different from the current one." };
  }

  try {
    const db = openDb();
    
    // Check if new username is already taken
    const checkStmt = db.prepare('SELECT username FROM users WHERE username = ?');
    const existingUser = checkStmt.get(newUsername);
    
    if (existingUser) {
      return { error: "Username already taken." };
    }

    // Update username
    const updateStmt = db.prepare('UPDATE users SET username = ? WHERE username = ?');
    const result = updateStmt.run(newUsername, oldUsername);
    
    if (result.changes === 0) {
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
    const db = openDb();

    // Verify user and password
    const userStmt = db.prepare('SELECT password FROM users WHERE username = ?');
    const user = userStmt.get(username) as { password: string } | undefined;

    if (!user) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password." };
    }

    // Check if new email is already used
    const checkStmt = db.prepare('SELECT email FROM users WHERE email = ?');
    const existingEmail = checkStmt.get(newEmail);
    
    if (existingEmail) {
      return { error: "Email already registered." };
    }

    // Update email
    const updateStmt = db.prepare('UPDATE users SET email = ? WHERE username = ?');
    updateStmt.run(newEmail, username);

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
    const db = openDb();

    // Verify user and current password
    const userStmt = db.prepare('SELECT password FROM users WHERE username = ?');
    const user = userStmt.get(username) as { password: string } | undefined;

    if (!user) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password." };
    }

    // Hash the new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updateStmt = db.prepare('UPDATE users SET password = ? WHERE username = ?');
    updateStmt.run(hashedNewPassword, username);

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
    const db = openDb();

    // Verify user and password
    const userStmt = db.prepare('SELECT password FROM users WHERE username = ?');
    const user = userStmt.get(username) as { password: string } | undefined;

    if (!user) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password." };
    }

    // Delete user
    const deleteStmt = db.prepare('DELETE FROM users WHERE username = ?');
    deleteStmt.run(username);

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account. Please try again." };
  }
}
