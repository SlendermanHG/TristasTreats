export default function ContactPage() {
  return (
    <main className="page-section">
      <div className="shell section-grid">
        <section className="section-card">
          <p className="eyebrow">Contact Direction</p>
          <h2>Email and form first</h2>
          <p className="muted">
            Public contact remains email and inquiry-form based for launch. No public phone number is shown yet.
          </p>
        </section>
        <section className="section-card">
          <p className="eyebrow">Business Address</p>
          <h2>Primary customer email</h2>
          <p className="muted">trista@tristastreats.com</p>
        </section>
        <section className="section-card">
          <p className="eyebrow">Inquiry Intake</p>
          <h2>Structured form planned</h2>
          <p className="muted">
            Name, email, phone, text-capable flag, preferred contact method, event date, optional pickup time, order
            type, description, optional budget, and up to 5 reference images.
          </p>
        </section>
      </div>
    </main>
  );
}
