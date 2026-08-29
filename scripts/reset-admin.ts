/**
 * Reset (or create) an admin account's password directly, bypassing the
 * normal seed script's "skip if it already exists" behavior.
 *
 * Use this when you're locked out of /admin/login — e.g. the account was
 * seeded with a random auto-generated password that got lost, or the
 * password in .env.local was changed after the account was already created
 * (the seed script never re-hashes an existing admin's password).
 *
 * Usage (run from the project root, with .env.local containing MONGODB_URI):
 *   npx tsx scripts/reset-admin.ts <email> <new-password>
 *
 * Example:
 *   npx tsx scripts/reset-admin.ts lramirezphilly1@gmail.com "MyNewPassword123!"
 *
 * If the email doesn't exist yet, this creates it. If it does, this
 * overwrites its password with the one you provide. Either way, log in
 * with exactly the email/password you passed here.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Admin } from "../src/models/Admin";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env if present

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/reset-admin.ts <email> <new-password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local first.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await Admin.findOne({ email: normalizedEmail });
  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`\nPassword reset for existing admin: ${normalizedEmail}`);
  } else {
    await Admin.create({ email: normalizedEmail, passwordHash, name: "Admin" });
    console.log(`\nNew admin account created: ${normalizedEmail}`);
  }

  console.log("You can now log in at /admin/login with that email and the password you just set.\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to reset admin:", err);
  process.exit(1);
});
