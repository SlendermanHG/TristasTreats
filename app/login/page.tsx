import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <div className="shell auth-grid">
        <section className="hero-copy">
          <p className="eyebrow">Private Access</p>
          <h1 className="page-title">Owner and TechAdmin sign in</h1>
          <p>
            This is the first authentication foundation for the private workspace. Password change enforcement,
            recovery, and audit flows will layer onto this foundation next.
          </p>
          <div className="actions">
            <Link className="button secondary" href="/">
              Back To Site
            </Link>
          </div>
        </section>

        <section className="auth-panel">
          <p className="eyebrow">Workspace Login</p>
          <h2>Sign in</h2>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
