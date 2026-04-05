import Image from "next/image";

const aboutSource =
  "At Trista's it's all about creating moments people will remember. I specialize in custom cakes, cupcakes, and cookies, all made with attention to detail. Whether you're celebrating a birthday, wedding, holiday, or just treating yourself, I'm passionate about bringing your vision to life with flavors and designs that are just as special as your occasion. Every order is handcrafted to not only look beautiful but taste amazing too.";

export default function AboutPage() {
  return (
    <main className="page-section">
      <div className="shell hero-grid">
        <section className="hero-copy">
          <p className="eyebrow">About Baseline</p>
          <h1 className="page-title">Source copy is loaded and ready for structured editing.</h1>
          <p>{aboutSource}</p>
          <p>
            This page is intentionally simple for the foundation pass. It establishes the source material that will
            later move into the editable CMS fields for Trista and the advanced editor for TechAdmin.
          </p>
        </section>

        <section className="hero-panel">
          <Image src="/images/Floral Cake.jpeg" alt="Tristas Treats floral cake" width={900} height={900} />
        </section>
      </div>
    </main>
  );
}
