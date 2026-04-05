"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createUserSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export type LoginState = {
  error?: string;
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user || !user.isActive) {
    return { error: "Invalid login." };
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return { error: "Invalid login." };
  }

  await createUserSession(user.id, user.role, rememberMe);
  redirect("/admin");
}
