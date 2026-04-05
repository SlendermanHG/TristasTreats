import { requireUser } from "@/lib/auth";

const sidebarItems = [
  "Inbox",
  "Contacts",
  "Inquiries",
  "Orders",
  "Gallery",
  "Reviews",
  "Abundance",
  "Content",
  "Analytics",
  "Audit Log"
];

export default function AdminPage() {
  return <AdminPageInner />;
}

async function AdminPageInner() {
  const user = await requireUser();

  return (
    <main className="dashboard-shell">
      <div className="shell dashboard-grid">
        <aside className="dashboard-sidebar">
          <section className="dashboard-panel">
            <p className="eyebrow">Private Workspace</p>
            <h2>Admin shell</h2>
            <ul className="mini-list">
              {sidebarItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="dashboard-main">
          <section className="dashboard-panel">
            <p className="eyebrow">Foundation Status</p>
            <h1 className="page-title">Owner workspace scaffold is live.</h1>
            <p className="muted">
              This route is the initial shell for the private workspace. Authentication, database-backed records,
              inbox sync, and content workflows will layer onto this foundation next.
            </p>
            <ul className="mini-list" style={{ marginTop: 18 }}>
              <li>
                Signed in as {user.name} ({user.role})
              </li>
              <li>Email: {user.email}</li>
              <li>Password reset required: {user.mustChangePassword ? "Yes" : "No"}</li>
            </ul>
            <form action="/logout" method="post" style={{ marginTop: 18 }}>
              <button className="button secondary" type="submit">
                Sign Out
              </button>
            </form>
          </section>

          <section className="dashboard-stats">
            <article className="stat">
              <strong>2</strong>
              <span>launch roles planned</span>
            </article>
            <article className="stat">
              <strong>10</strong>
              <span>workspace modules scaffolded</span>
            </article>
            <article className="stat">
              <strong>IMAP</strong>
              <span>mailbox integration baseline confirmed</span>
            </article>
          </section>

          <section className="dashboard-panel">
            <p className="eyebrow">Next Build Slice</p>
            <h2>Coming next in code</h2>
            <ul className="mini-list">
              <li>Prisma schema and PostgreSQL models</li>
              <li>Seeded Owner and TechAdmin user foundation</li>
              <li>Draft/publish content models</li>
              <li>Inquiry, order, contact, and gallery data structures</li>
            </ul>
          </section>
        </section>
      </div>
    </main>
  );
}
