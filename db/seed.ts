import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = mysql.createPool({ uri: connectionString });
const db = drizzle(pool, { schema, mode: "default" });

async function seed() {
  console.log("Seeding database...");

  // Seed colleges
  const collegeData = [
    { name: "College of Sciences", department: "Computer Science" },
    { name: "College of Business and Management", department: "Business Administration" },
    { name: "College of Teacher Education", department: "Education" },
    { name: "College of Fisheries and Marine Science", department: "Fisheries" },
  ];
  await db.insert(schema.colleges).values(collegeData);
  console.log("Colleges seeded");

  // Seed requirement types
  const reqTypes = [
    { name: "Resume", description: "Student resume/CV" },
    { name: "Application Letter", description: "Formal application letter" },
    { name: "Endorsement Letter", description: "School endorsement" },
    { name: "Medical Certificate", description: "Health clearance" },
    { name: "Insurance", description: "Insurance documents" },
    { name: "Parents Consent", description: "Guardian consent form" },
  ];
  await db.insert(schema.requirementTypes).values(reqTypes);
  console.log("Requirement types seeded");

  // Seed users with hashed passwords
  const hashedPassword = await bcrypt.hash("password123", 10);
  const usersData = [
    {
      unionId: "dev-admin",
      name: "Admin User",
      email: "admin@bisu.edu.ph",
      password: hashedPassword,
      role: "admin" as const,
      collegeId: 1,
    },
    {
      unionId: "dev-coordinator",
      name: "Coordinator User",
      email: "coordinator@bisu.edu.ph",
      password: hashedPassword,
      role: "coordinator" as const,
      collegeId: 1,
    },
    {
      unionId: "dev-supervisor",
      name: "Supervisor User",
      email: "supervisor@bisu.edu.ph",
      password: hashedPassword,
      role: "supervisor" as const,
      collegeId: 1,
    },
    {
      unionId: "dev-student",
      name: "Student User",
      email: "student@bisu.edu.ph",
      password: hashedPassword,
      role: "student" as const,
      collegeId: 1,
    },
    {
      unionId: "dev-sipp_coordinator",
      name: "SIPP Coordinator User",
      email: "sipp@bisu.edu.ph",
      password: hashedPassword,
      role: "sipp_coordinator" as const,
      collegeId: 1,
    },
  ];

  for (const user of usersData) {
    await db.insert(schema.users).values(user).onDuplicateKeyUpdate({
      set: { name: user.name, email: user.email, password: user.password, role: user.role },
    });
  }
  console.log("Users seeded (password: password123)");

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch(console.error);