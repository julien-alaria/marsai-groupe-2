
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import bcrypt from "bcrypt";
import db from "../src/models/index.js";

async function createAdmin() {
  const hash = await bcrypt.hash("admin123", 10);
  const [admin, created] = await db.User.findOrCreate({
    where: { email: "admin@example.com" },
    defaults: {
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      password: hash,
      phone: "0000000000",
      role: "ADMIN"
    }
  });
  if (created) {
    console.log("Admin user created:", admin.email);
  } else {
    console.log("Admin user already exists:", admin.email);
  }
  await db.sequelize.close();
}

createAdmin().catch(console.error);
