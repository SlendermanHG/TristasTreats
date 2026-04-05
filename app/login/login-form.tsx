"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="auth-form">
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
      </label>

      <label className="field">
        <span>Password</span>
        <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      </label>

      <label className="checkbox-row">
        <input name="rememberMe" type="checkbox" />
        <span>Keep me signed in on this device</span>
      </label>

      {state.error ? <p className="form-error">{state.error}</p> : null}

      <button className="button" disabled={pending} type="submit">
        {pending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
