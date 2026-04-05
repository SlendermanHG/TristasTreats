import Image from "next/image";
import Link from "next/link";

const publicPages = [
  "Home",
  "Gallery",
  "About",
  "Inquiry / Order",
  "Reviews",
  "Abundance / Available Now",
  "Contact"
];

const workspaceModules = [
  "Inbox and contacts",
  "Inquiries and orders",
  "Gallery and reviews",
  "Draft/publish CMS",
  "Analytics dashboard",
  "Audit log and exports"
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="shell site-header-inner">
          <Link href="/" className="brand">
            <div className="brand-mark">
              <Image src="/images/logo-card-clean.jpg" alt="Tristas Treats logo" width={58} height={58} />
            </div>
            <div className="brand-copy">
              <strong>Tristas Treats</strong>
              <span>Public storefront plus private owner workspace</span>
            </div>
          </Link>

          <nav className="nav" aria-label="Primary">
            <Link href="/" data-active="true">
              Home
            </Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Implementation Started</p>
              <h1>Tristas Treats is now a real application build, not a placeholder page.</h1>
              <p>
                The platform foundation is being rebuilt for a custom cake storefront, a private owner workspace, a
                structured inbox, inquiries, orders, gallery management, reviews, abundance listings, and internal
                analytics.
              </p>
              <div className="actions">
                <Link className="button" href="/admin">
                  Open Admin Shell
                </Link>
                <Link className="button secondary" href="/about">
                  View Content Baseline
                </Link>
              </div>
            </div>

            <div className="hero-panel">
              <Image
                src="/images/Witch's Brew Twin Cakes.jpeg"
                alt="Featured Tristas Treats cake"
                width={900}
                height={900}
                priority
              />
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="shell section-grid">
            <article className="section-card">
              <p className="kicker">Public Site</p>
              <h2>Launch page structure</h2>
              <ul className="mini-list">
                {publicPages.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="section-card">
              <p className="kicker">Owner Workspace</p>
              <h2>Core modules already planned</h2>
              <ul className="mini-list">
                {workspaceModules.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="section-card">
              <p className="kicker">Current Build Direction</p>
              <h2>Infrastructure baseline</h2>
              <ul className="mini-list">
                <li>Next.js single app</li>
                <li>Render web service + Render Postgres</li>
                <li>Network Solutions IMAP/SMTP mailbox</li>
                <li>Umami-backed analytics dashboard</li>
                <li>Maintenance bot deferred as separate internal service</li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
