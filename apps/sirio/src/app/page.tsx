import Image from "next/image";

const principles = [
  {
    label: "Quiet Authority",
    text: "Qoovex does not shout. Structure, spacing and language carry authority without decorative noise.",
  },
  {
    label: "Operational Clarity",
    text: "A chef must understand location, object, state and next action within seconds.",
  },
  {
    label: "Professional Warmth",
    text: "The system is precise and technical, but it remembers steel, heat, rhythm and real service.",
  },
  {
    label: "Information Before Decoration",
    text: "Legibility, hierarchy and action come before visual effect. Beauty is the result of precision.",
  },
  {
    label: "One Action, One Meaning",
    text: "Every color, state and control has one job. No signal is decorative.",
  },
] as const;

const colors = [
  ["Porcelain", "#FAF9F6", "Working surface"],
  ["Graphite", "#111111", "Structure"],
  ["Steel", "#8A8A84", "Separation"],
  ["Heat", "#D96B2B", "Primary action"],
  ["Herb", "#5F7A4F", "Verified"],
  ["Wheat", "#C9A646", "Attention"],
] as const;

const modes = [
  {
    name: "Planning",
    intent: "Build recipes, menus and quantities with enough room to think.",
    density: "Medium density",
  },
  {
    name: "Preparation",
    intent: "Group work into batches, ingredients and next visible tasks.",
    density: "Ordered density",
  },
  {
    name: "Service",
    intent: "Large targets, fewer choices, stronger contrast and immediate state.",
    density: "Kitchen density",
  },
  {
    name: "Review",
    intent: "Check allergens, costs, QR and publishing before anything becomes public.",
    density: "Analytical density",
  },
] as const;

const states = [
  ["Unsaved", "Heat surface", "A local change needs attention."],
  ["Allergen critical", "Error surface", "Risk is tied to the ingredient that caused it."],
  ["Scaled quantity", "Steel outline", "The system recalculated related values."],
  ["Ready for service", "Herb surface", "Preparation can move forward."],
] as const;

const quality = [
  "5-second test",
  "Distance test",
  "No-color test",
  "One-primary-action test",
  "Kitchen-stress test",
  "Pixel audit",
] as const;

export default function SirioPage() {
  return (
    <main className="sirio-shell">
      <header className="sirio-nav" aria-label="Sirio navigation">
        <a className="sirio-brand" href="#top">
          <Image
            alt=""
            aria-hidden="true"
            height={28}
            priority
            src="/logo-icon/sirio-icon.svg"
            style={{ height: 28, width: 28 }}
            width={28}
          />
          <span>Sirio</span>
        </a>
        <nav aria-label="Design sections">
          <a href="#principles">Principles</a>
          <a href="#tokens">Tokens</a>
          <a href="#modes">Modes</a>
          <a href="#quality">Quality</a>
        </nav>
      </header>

      <section className="sirio-hero" id="top">
        <div className="sirio-hero-copy">
          <p className="sirio-kicker">Measured Heat Foundations v0</p>
          <h1>Finally, everything is in its place.</h1>
          <p>
            A pre-component design foundation for Qoovex: quiet authority,
            operational clarity and professional warmth for chefs working under
            real pressure.
          </p>
        </div>

        <div className="sirio-instrument" aria-label="Operational service rail">
          <div className="sirio-instrument-head">
            <span>Service rail</span>
            <strong>18:42</strong>
          </div>
          <div className="sirio-rail-row" data-tone="heat">
            <span>Ravioli ricotta</span>
            <strong>Scale 24 portions</strong>
          </div>
          <div className="sirio-rail-row" data-tone="wheat">
            <span>Fresh pasta</span>
            <strong>Allergen check</strong>
          </div>
          <div className="sirio-rail-row" data-tone="herb">
            <span>Vegetable stock</span>
            <strong>Ready</strong>
          </div>
          <div className="sirio-rail-row">
            <span>Shopping list</span>
            <strong>Generated</strong>
          </div>
        </div>
      </section>

      <section className="sirio-section" id="principles">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Design principles</p>
          <h2>The interface earns its place.</h2>
        </div>
        <div className="sirio-principles">
          {principles.map((principle) => (
            <article className="sirio-principle" key={principle.label}>
              <h3>{principle.label}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sirio-section sirio-token-section" id="tokens">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Token foundation</p>
          <h2>Material first, semantic always.</h2>
          <p>
            Components will not use primitive values directly. The foundation
            separates material color from action, state, surface and text.
          </p>
        </div>

        <div className="sirio-color-grid">
          {colors.map(([name, value, purpose]) => (
            <article className="sirio-swatch" key={name}>
              <span style={{ backgroundColor: value }} />
              <div>
                <h3>{name}</h3>
                <p>{value}</p>
                <small>{purpose}</small>
              </div>
            </article>
          ))}
        </div>

        <div className="sirio-type-board" aria-label="Typography specimens">
          <p className="sirio-kicker">Type scale</p>
          <p className="sirio-display-sample">Precision becomes beautiful.</p>
          <p className="sirio-body-sample">
            Recipes, allergens, quantities and preparation steps must stay
            readable on a tablet, in a kitchen and during service.
          </p>
          <p className="sirio-data-sample">24 portions / 1.250 kg / 18 min</p>
        </div>
      </section>

      <section className="sirio-section" id="modes">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Operating modes</p>
          <h2>Qoovex follows the kitchen state.</h2>
        </div>
        <div className="sirio-mode-grid">
          {modes.map((mode) => (
            <article className="sirio-mode" key={mode.name}>
              <span>{mode.density}</span>
              <h3>{mode.name}</h3>
              <p>{mode.intent}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sirio-section sirio-state-section">
        <div className="sirio-section-head">
          <p className="sirio-kicker">State language</p>
          <h2>Every state explains what changed.</h2>
        </div>
        <div className="sirio-state-list">
          {states.map(([name, tone, meaning]) => (
            <div className="sirio-state-row" key={name}>
              <strong>{name}</strong>
              <span>{tone}</span>
              <p>{meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sirio-section sirio-quality" id="quality">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Quality bar</p>
          <h2>Not beautiful. Resolved.</h2>
          <p>
            A future component must pass these checks before it enters
            `packages/ui`.
          </p>
        </div>
        <ul>
          {quality.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
