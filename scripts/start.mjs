import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("==> Pushing Prisma schema to database");
run("npx", ["prisma", "db", "push"]);

console.log("==> Seeding baseline users");
run("npm", ["run", "seed"]);

console.log("==> Starting Next.js");
run("npx", ["next", "start", "-p", process.env.PORT || "3000"]);
