import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function upsertUser({ email, name, role, passwordHash }) {
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      passwordHash,
      mustChangePassword: true,
      isActive: true
    },
    create: {
      email,
      name,
      role,
      passwordHash,
      mustChangePassword: true,
      isActive: true
    }
  });
}

async function main() {
  const initialPassword = requireEnv("INITIAL_ADMIN_PASSWORD");
  const ownerEmail = requireEnv("OWNER_EMAIL");
  const ownerName = requireEnv("OWNER_NAME");
  const techAdminEmail = requireEnv("TECHADMIN_EMAIL");
  const techAdminName = requireEnv("TECHADMIN_NAME");

  const passwordHash = await bcrypt.hash(initialPassword, 12);

  await upsertUser({
    email: ownerEmail,
    name: ownerName,
    role: UserRole.OWNER,
    passwordHash
  });

  await upsertUser({
    email: techAdminEmail,
    name: techAdminName,
    role: UserRole.TECH_ADMIN,
    passwordHash
  });

  console.log("Seeded Owner and TechAdmin accounts.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
